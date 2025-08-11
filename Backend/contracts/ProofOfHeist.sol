// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ProofOfHeist is ERC721, Ownable, ReentrancyGuard {
    uint256 public constant ENTRY_FEE = 0.01 ether;
    uint256 public constant PASSING_SCORE = 14;
    uint256 private _tokenIdCounter;
    string public baseURI;
    
    struct Player {
        uint8 attempts;
        uint8 bestScore;
        uint256 lastAttempt;
        bool canMint;
    }
    
    mapping(address => Player) public players;
    mapping(uint256 => string) private _tokenURIs;

    event NFTMinted(address indexed player, uint256 tokenId);
    error InsufficientFee();
    error AlreadyMinted();
    error ScoreTooLow();

    constructor(string memory _baseURI) ERC721("Proof of Heist", "POH") Ownable(msg.sender) {
        baseURI = _baseURI;
    }

    function submitQuiz(uint8 score) external payable nonReentrant {
        require(score <= 16, "Invalid score");
        
        if (msg.value != ENTRY_FEE) revert InsufficientFee();
        
        Player storage player = players[msg.sender];
        
        if (player.canMint) revert AlreadyMinted();
        
        player.attempts++;
        player.lastAttempt = block.timestamp;
        
        if (score > player.bestScore) {
            player.bestScore = score;
            player.canMint = score >= PASSING_SCORE;
        }
    }

    function mintNFT() external nonReentrant {
        Player storage player = players[msg.sender];
        require(player.canMint, "Not eligible");
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = string(abi.encodePacked(baseURI, "/", _toString(tokenId), ".json"));
        
        player.canMint = false;
        emit NFTMinted(msg.sender, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId)  != address(0), "Nonexistent token");
        return _tokenURIs[tokenId];
    }

    

    // Helper function
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
}