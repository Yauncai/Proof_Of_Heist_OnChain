// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * ProofOfHeist 
 * - Pay entry fee to receive a one-time ticket
 * - Submit score consumes a ticket and records best score 
 * - Owner grants eligibility off-chain after verification
 * - One mint per address 
 * - Withdraw and pause controls
 */
contract ProofOfHeist is ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;

    uint256 public constant ENTRY_FEE = 0.00001 ether;
    uint256 public constant PASSING_SCORE = 14; 

    uint256 private _tokenIdCounter = 1; 
    string public baseURI;
    bool public autoEligibility = true; 

    // Supply and rate-limiting controls
    uint256 public maxSupply = 1000; 
    uint256 public submitCooldown = 600; 
    uint256 public maxAttemptsPerAddress = 0; 

    struct Player {
        uint8 attempts;       
        uint8 bestScore;       
        uint256 lastAttempt;   
        uint256 tickets;       
        bool eligible;         
        bool hasMinted;        
    }

    mapping(address => Player) public players;

    // Errors
    error InsufficientFee();
    error NoTicket();
    error InvalidScore();
    error NotEligible();
    error AlreadyMinted();
    error MaxSupplyReached();
    error CooldownActive();
    error AttemptsExceeded();

    // Events
    event EntryPaid(address indexed player, uint256 amount);
    event QuizSubmitted(address indexed player, uint8 score);
    event EligibilityUpdated(address indexed player, bool eligible, uint8 bestScore);
    event NFTMinted(address indexed player, uint256 tokenId);
    event FundsWithdrawn(address indexed to, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    event AutoEligibilityUpdated(bool enabled);
    event MaxSupplyUpdated(uint256 maxSupply);
    event SubmitCooldownUpdated(uint256 cooldownSeconds);
    event MaxAttemptsPerAddressUpdated(uint256 maxAttempts);

    constructor(string memory _baseURI) ERC721("Proof of Heist", "POH") Ownable(msg.sender) {
        baseURI = _baseURI;
    }

    
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function setAutoEligibility(bool enabled) external onlyOwner {
        autoEligibility = enabled;
        emit AutoEligibilityUpdated(enabled);
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        require(newMaxSupply == 0 || newMaxSupply >= _tokenIdCounter - 1, "Below minted count");
        maxSupply = newMaxSupply;
        emit MaxSupplyUpdated(newMaxSupply);
    }

    function setSubmitCooldown(uint256 seconds_) external onlyOwner {
        submitCooldown = seconds_;
        emit SubmitCooldownUpdated(seconds_);
    }

    function setMaxAttemptsPerAddress(uint256 maxAttempts) external onlyOwner {
        maxAttemptsPerAddress = maxAttempts;
        emit MaxAttemptsPerAddressUpdated(maxAttempts);
    }

    function withdraw(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        uint256 amount = address(this).balance;
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "Withdraw failed");
        emit FundsWithdrawn(to, amount);
    }

    
    function setEligibility(address player, bool isEligible) external onlyOwner {
        Player storage p = players[player];
        require(!p.hasMinted, "Already minted");
        p.eligible = isEligible;
        emit EligibilityUpdated(player, isEligible, p.bestScore);
    }

    // -------- Player Flow --------

    // 1) Pay to enter (receive a one-time ticket)
    function enterGame() external payable nonReentrant whenNotPaused {
        if (msg.value != ENTRY_FEE) revert InsufficientFee();
        players[msg.sender].tickets += 1;
        emit EntryPaid(msg.sender, msg.value);
    }

    // 2) Submit score (consumes a ticket). Optionally grants eligibility on-chain for MVP.
    function submitScore(uint8 score) external nonReentrant whenNotPaused {
        if (score > 16) revert InvalidScore();

        Player storage p = players[msg.sender];
        if (p.tickets == 0) revert NoTicket();

        
        if (submitCooldown > 0 && p.lastAttempt != 0) {
            if (block.timestamp < p.lastAttempt + submitCooldown) revert CooldownActive();
        }

        
        if (maxAttemptsPerAddress > 0 && p.attempts >= maxAttemptsPerAddress) {
            revert AttemptsExceeded();
        }

        // consume a ticket
        p.tickets -= 1;
        p.attempts += 1;
        p.lastAttempt = block.timestamp;

        if (score > p.bestScore) {
            p.bestScore = score;
        }

        
        if (autoEligibility && !p.hasMinted && score >= PASSING_SCORE && !p.eligible) {
            p.eligible = true;
            emit EligibilityUpdated(msg.sender, true, p.bestScore);
        }

        emit QuizSubmitted(msg.sender, score);
    }

    // 3) Mint once if eligible
    function mintNFT() external nonReentrant whenNotPaused {
        Player storage p = players[msg.sender];
        if (!p.eligible) revert NotEligible();
        if (p.hasMinted) revert AlreadyMinted();

        
        if (maxSupply > 0 && _tokenIdCounter > maxSupply) revert MaxSupplyReached();

        
        p.eligible = false;
        p.hasMinted = true;

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        emit NFTMinted(msg.sender, tokenId);
    }

    
   function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return string(abi.encodePacked(baseURI, "/", tokenId.toString(), ".json"));
    }
}


