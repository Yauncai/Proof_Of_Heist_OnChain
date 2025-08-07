// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ProofOfHeist
 * @dev NFT Quiz Game Smart Contract for crypto heist knowledge
 * @author Your Name
 */
contract ProofOfHeist is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    
    // ===== CONSTANTS =====
    uint256 public constant ENTRY_FEE = 0.01 ether;
    uint256 public constant PASSING_SCORE = 14;
    uint256 public constant TOTAL_QUESTIONS = 16;
    uint256 public constant COOLDOWN_PERIOD = 8 minutes;
    uint256 public constant SUCCESS_REFUND_PERCENTAGE = 25;
    
    // ===== STATE VARIABLES =====
    uint256 private _tokenIdCounter;
    string public baseMetadataURI;
    uint256 public totalMetadataCount; // Number of different NFT metadata available
    
    // Player tracking
    struct PlayerAttempt {
        bytes32 answerCommitment;
        uint256 timestamp;
        bool hasRevealed;
        uint8 score;
        bool hasClaimedNFT;
        bool isActive;
    }
    
    mapping(address => PlayerAttempt) public playerAttempts;
    mapping(address => uint256) public lastAttemptTime;
    mapping(address => uint256) public totalAttempts;
    mapping(address => uint256) public successfulAttempts;
    
    // Game statistics
    uint256 public totalPlayersParticipated;
    uint256 public totalSuccessfulCompletions;
    uint256 public contractBalance;
    
    // ===== EVENTS =====
    event QuizStarted(address indexed player, bytes32 commitment, uint256 timestamp);
    event QuizCompleted(address indexed player, uint8 score, bool passed);
    event NFTMinted(address indexed player, uint256 tokenId, string tokenURI);
    event RefundIssued(address indexed player, uint256 amount);
    event MetadataUpdated(string newBaseURI, uint256 newCount);
    
    // ===== ERRORS =====
    error InsufficientFee();
    error CooldownNotExpired();
    error NoActiveAttempt();
    error AlreadyRevealed();
    error InvalidReveal();
    error QuizNotPassed();
    error NFTAlreadyClaimed();
    error InvalidScore();
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
    
    // ===== MAIN GAME FUNCTIONS =====
    
    /**
     * @dev Start a new quiz attempt by submitting commitment hash
     * @param _answerCommitment Hash of player's answers (keccak256(answers + nonce))
     */
    function startQuiz(bytes32 _answerCommitment) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        if (msg.value != ENTRY_FEE) revert InsufficientFee();
        if (block.timestamp < lastAttemptTime[msg.sender] + COOLDOWN_PERIOD) {
            revert CooldownNotExpired();
        }
        
        // Track new player
        if (totalAttempts[msg.sender] == 0) {
            totalPlayersParticipated++;
        }
        
        // Initialize/reset player attempt
        playerAttempts[msg.sender] = PlayerAttempt({
            answerCommitment: _answerCommitment,
            timestamp: block.timestamp,
            hasRevealed: false,
            score: 0,
            hasClaimedNFT: false,
            isActive: true
        });
        
        lastAttemptTime[msg.sender] = block.timestamp;
        totalAttempts[msg.sender]++;
        contractBalance += msg.value;
        
        emit QuizStarted(msg.sender, _answerCommitment, block.timestamp);
    }
    
    /**
     * @dev Reveal answers and get score calculated
     * @param _answers Array of answer indices (0-3 for multiple choice)
     * @param _nonce Random nonce used in commitment
     * @param _correctAnswers Array of correct answer indices for verification
     */
    function revealAnswers(
        uint8[] calldata _answers,
        uint256 _nonce,
        uint8[] calldata _correctAnswers
    ) external whenNotPaused nonReentrant {
        PlayerAttempt storage attempt = playerAttempts[msg.sender];
        
        if (!attempt.isActive) revert NoActiveAttempt();
        if (attempt.hasRevealed) revert AlreadyRevealed();
        if (_answers.length != TOTAL_QUESTIONS) revert InvalidScore();
        if (_correctAnswers.length != TOTAL_QUESTIONS) revert InvalidScore();
        
        // Verify commitment
        bytes32 hash = keccak256(abi.encodePacked(_answers, _nonce));
        if (hash != attempt.answerCommitment) revert InvalidReveal();
        
        // Calculate score
        uint8 score = 0;
        for (uint256 i = 0; i < TOTAL_QUESTIONS; i++) {
            if (_answers[i] == _correctAnswers[i]) {
                score++;
            }
        }
        
        attempt.score = score;
        attempt.hasRevealed = true;
        
        bool passed = score >= PASSING_SCORE;
        if (passed) {
            successfulAttempts[msg.sender]++;
            totalSuccessfulCompletions++;
            
            // Issue refund for successful completion
            uint256 refundAmount = (ENTRY_FEE * SUCCESS_REFUND_PERCENTAGE) / 100;
            if (address(this).balance >= refundAmount) {
                contractBalance -= refundAmount;
                (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
                if (success) {
                    emit RefundIssued(msg.sender, refundAmount);
                }
            }
        }
        
        emit QuizCompleted(msg.sender, score, passed);
    }
    
    /**
     * @dev Mint NFT for successful quiz completion
     */
    function mintNFT() external whenNotPaused nonReentrant {
        PlayerAttempt storage attempt = playerAttempts[msg.sender];
        
        if (!attempt.isActive) revert NoActiveAttempt();
        if (!attempt.hasRevealed) revert InvalidReveal();
        if (attempt.score < PASSING_SCORE) revert QuizNotPassed();
        if (attempt.hasClaimedNFT) revert NFTAlreadyClaimed();
        
        // Generate random NFT metadata
        uint256 randomIndex = _generateRandomMetadataIndex(msg.sender, attempt.timestamp);
        string memory nftTokenURI = string(abi.encodePacked(baseMetadataURI, "/", _toString(randomIndex), ".json"));
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        attempt.hasClaimedNFT = true;
        attempt.isActive = false;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, nftTokenURI);
        
        emit NFTMinted(msg.sender, tokenId, nftTokenURI);
    }
    
    // ===== VIEW FUNCTIONS =====
    
    /**
     * @dev Get player's current attempt status
     */
    function getPlayerStatus(address _player) external view returns (
        bool hasActiveAttempt,
        bool hasRevealed,
        uint8 score,
        bool canMintNFT,
        uint256 cooldownRemaining,
        uint256 totalAttempts_,
        uint256 successfulAttempts_
    ) {
        PlayerAttempt memory attempt = playerAttempts[_player];
        
        uint256 cooldown;
        uint256 timeSinceLastAttempt = block.timestamp - lastAttemptTime[_player];
        if (timeSinceLastAttempt >= COOLDOWN_PERIOD) {
            cooldown = 0;
        } else {
            cooldown = COOLDOWN_PERIOD - timeSinceLastAttempt;
        }
        
        bool canMint = attempt.hasRevealed && 
                      attempt.score >= PASSING_SCORE && 
                      !attempt.hasClaimedNFT;
        
        return (
            attempt.isActive,
            attempt.hasRevealed,
            attempt.score,
            canMint,
            cooldown,
            totalAttempts[_player],
            successfulAttempts[_player]
        );
    }
    
    /**
     * @dev Get game statistics
     */
    function getGameStats() external view returns (
        uint256 totalPlayers,
        uint256 totalCompletions,
        uint256 totalNFTsMinted,
        uint256 currentBalance
    ) {
        return (
            totalPlayersParticipated,
            totalSuccessfulCompletions,
            _tokenIdCounter,
            address(this).balance
        );
    }
    
    /**
     * @dev Check if player can start a new quiz
     */
    function canStartQuiz(address _player) external view returns (bool) {
        return block.timestamp >= lastAttemptTime[_player] + COOLDOWN_PERIOD;
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
        
        contractBalance -= _amount;
        (bool success, ) = payable(owner()).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency withdraw all (owner only)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        contractBalance = 0;
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
            block.prevrandao, // Updated from block.difficulty
            block.timestamp,
            _tokenIdCounter
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