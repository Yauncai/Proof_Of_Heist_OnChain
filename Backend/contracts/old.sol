// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProofOfHeist
 * @dev NFT Quiz Game Smart Contract 
 * @author Yauncai
 */
contract ProofOfHeist is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    
    // ===== CONSTANTS =====
    uint256 public constant ENTRY_FEE = 0.01 ether;
    uint256 public constant PASSING_SCORE = 14;  // 14/16 = 87.5%
    uint256 public constant TOTAL_QUESTIONS = 16;
    uint256 public constant MAX_ATTEMPTS = 3;
    uint256 public constant COOLDOWN_PERIOD = 8 minutes;
    uint256 public constant SUCCESS_REFUND_PERCENTAGE = 25;
    
    // ===== STATE VARIABLES =====
    uint256 private _tokenIdCounter;
    string public baseMetadataURI;
    uint256 public totalMetadataCount;
    
    // Player tracking
    struct PlayerData {
        uint256 totalAttempts;
        uint256 successfulAttempts;
        uint256 lastAttemptTime;
        uint256 bestScore;
        bool hasMintedNFT;
    }
    
    mapping(address => PlayerData) public players;
    
    // Game statistics
    uint256 public totalPlayersParticipated;
    uint256 public totalSuccessfulCompletions;
    uint256 public totalNFTsMinted;
    
    // ===== EVENTS =====
    event QuizAttempted(address indexed player, uint8 score, bool passed, uint256 attemptNumber);
    event NFTMinted(address indexed player, uint256 tokenId, string tokenURI, uint8 score);
    event RefundIssued(address indexed player, uint256 amount);
    event MetadataUpdated(string newBaseURI, uint256 newCount);
    
    // ===== ERRORS =====
    error InsufficientFee();
    error CooldownNotExpired();
    error InvalidScore();
    error ScoreTooLow();
    error MaxAttemptsReached();
    error AlreadyMintedNFT();
    error InsufficientBalance();
    error InvalidMetadataCount();
    
    // ===== CONSTRUCTOR =====
    constructor(
        string memory _baseMetadataURI,
        uint256 _totalMetadataCount
    ) ERC721("Proof of Heist", "POH") Ownable(msg.sender) {
        if (_totalMetadataCount == 0) revert InvalidMetadataCount();
        baseMetadataURI = _baseMetadataURI;
        totalMetadataCount = _totalMetadataCount;
    }
    
    // ===== MAIN FUNCTIONS =====
    
    /**
     * @dev Submit quiz results and mint NFT if score is sufficient
     * @param _score Player's quiz score (0-16)
     */
    function submitQuizAndMint(
        uint8 _score 
    ) external payable whenNotPaused nonReentrant {
        
        PlayerData storage player = players[msg.sender];
        
        // Validate payment
        if (msg.value != ENTRY_FEE) revert InsufficientFee();
        
        // Check cooldown
        if (block.timestamp < player.lastAttemptTime + COOLDOWN_PERIOD) {
            revert CooldownNotExpired();
        }
        
        // Check max attempts (reset after successful mint)
        if (!player.hasMintedNFT && player.totalAttempts >= MAX_ATTEMPTS) {
            revert MaxAttemptsReached();
        }
        
        // Validate score
        if (_score > TOTAL_QUESTIONS) revert InvalidScore();
        
        // Track new player
        if (player.totalAttempts == 0) {
            totalPlayersParticipated++;
        }
        
        // Update player data
        player.totalAttempts++;
        player.lastAttemptTime = block.timestamp;
        if (_score > player.bestScore) {
            player.bestScore = _score;
        }
        
        bool passed = _score >= PASSING_SCORE;
        
        if (passed) {
            if (player.hasMintedNFT) revert AlreadyMintedNFT();
            
            player.successfulAttempts++;
            totalSuccessfulCompletions++;
            
            // Mint NFT
            _mintPlayerNFT(msg.sender, _score);
            
            // Issue refund for successful completion
            uint256 refundAmount = (ENTRY_FEE * SUCCESS_REFUND_PERCENTAGE) / 100;
            if (address(this).balance >= refundAmount) {
                (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
                if (success) {
                    emit RefundIssued(msg.sender, refundAmount);
                }
            }
            
            // Reset attempts for this player
            player.totalAttempts = 0;
            
        } else {
            // Failed attempt
            if (_score < PASSING_SCORE) {
                // No refund for failed attempts
            }
        }
        
        emit QuizAttempted(msg.sender, _score, passed, player.totalAttempts);
    }
    
    /**
     * @dev Internal function to mint NFT
     */
    function _mintPlayerNFT(address _player, uint8 _score) internal {
        PlayerData storage player = players[_player];
        
        if (player.hasMintedNFT) revert AlreadyMintedNFT();
        
        // Generate random NFT metadata
        uint256 randomIndex = _generateRandomMetadataIndex(_player, block.timestamp);
        string memory nftTokenURI = string(abi.encodePacked(
            baseMetadataURI, 
            "/", 
            _toString(randomIndex), 
            ".json"
        ));
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        totalNFTsMinted++;
        
        player.hasMintedNFT = true;
        
        _safeMint(_player, tokenId);
        _setTokenURI(tokenId, nftTokenURI);
        
        emit NFTMinted(_player, tokenId, nftTokenURI, _score);
    }
    
    // ===== VIEW FUNCTIONS =====
    
    /**
     * @dev Get player's status and stats
     */
    function getPlayerStatus(address _player) external view returns (
        uint256 totalAttempts,
        uint256 successfulAttempts,
        uint256 bestScore,
        bool hasMintedNFT,
        uint256 cooldownRemaining,
        uint256 attemptsRemaining,
        bool canAttempt
    ) {
        PlayerData memory player = players[_player];
        
        uint256 cooldown = 0;
        if (player.lastAttemptTime > 0) {
            uint256 timeSinceLastAttempt = block.timestamp - player.lastAttemptTime;
            if (timeSinceLastAttempt < COOLDOWN_PERIOD) {
                cooldown = COOLDOWN_PERIOD - timeSinceLastAttempt;
            }
        }
        
        uint256 remaining = 0;
        if (!player.hasMintedNFT && player.totalAttempts < MAX_ATTEMPTS) {
            remaining = MAX_ATTEMPTS - player.totalAttempts;
        }
        
        bool canPlay = cooldown == 0 && remaining > 0;
        
        return (
            player.totalAttempts,
            player.successfulAttempts,
            player.bestScore,
            player.hasMintedNFT,
            cooldown,
            remaining,
            canPlay
        );
    }
    
    /**
     * @dev Get game statistics
     */
    function getGameStats() external view returns (
        uint256 totalPlayers,
        uint256 totalCompletions,
        uint256 totalNFTsMinted_,
        uint256 currentBalance,
        uint256 passRate // percentage of successful completions
    ) {
        uint256 rate = totalPlayersParticipated > 0 
            ? (totalSuccessfulCompletions * 100) / totalPlayersParticipated 
            : 0;
            
        return (
            totalPlayersParticipated,
            totalSuccessfulCompletions,
            totalNFTsMinted,
            address(this).balance,
            rate
        );
    }
    
    /**
     * @dev Check if player can start a new quiz
     */
    function canStartQuiz(address _player) external view returns (bool, string memory reason) {
        PlayerData memory player = players[_player];
        
        if (player.hasMintedNFT) {
            return (false, "Already minted NFT");
        }
        
        if (player.totalAttempts >= MAX_ATTEMPTS) {
            return (false, "Max attempts reached");
        }
        
        if (block.timestamp < player.lastAttemptTime + COOLDOWN_PERIOD) {
            return (false, "Cooldown period active");
        }
        
        return (true, "Can start quiz");
    }
    
    // ===== ADMIN FUNCTIONS =====
    
    /**
     * @dev Update metadata URI and count
     */
    function updateMetadata(string calldata _newBaseURI, uint256 _newCount) 
        external 
        onlyOwner 
    {
        if (_newCount == 0) revert InvalidMetadataCount();
        baseMetadataURI = _newBaseURI;
        totalMetadataCount = _newCount;
        emit MetadataUpdated(_newBaseURI, _newCount);
    }
    
    /**
     * @dev Reset player's attempts (admin emergency function)
     */
    function resetPlayerAttempts(address _player) external onlyOwner {
        players[_player].totalAttempts = 0;
        players[_player].lastAttemptTime = 0;
    }
    
    /**
     * @dev Emergency pause/unpause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount > address(this).balance) revert InsufficientBalance();
        
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency withdraw all (owner only)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
    
    // ===== INTERNAL FUNCTIONS =====
    
    /**
     * @dev Generate pseudo-random metadata index
     */
    function _generateRandomMetadataIndex(address _player, uint256 _timestamp) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 randomHash = uint256(keccak256(abi.encodePacked(
            _player,
            _timestamp,
            block.prevrandao,
            block.timestamp,
            _tokenIdCounter,
            players[_player].bestScore
        )));
        return randomHash % totalMetadataCount;
    }
    
    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    // ===== OVERRIDES =====
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}