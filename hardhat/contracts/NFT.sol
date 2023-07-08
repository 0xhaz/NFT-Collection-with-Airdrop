// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private s_tokenIds;

    string private s_baseExtension = ".json";
    uint256 private s_cost;
    uint256 private s_maxSupply;
    uint256 private s_maxMintAmount;
    string private s_baseURI;
    uint256 private s_totalSupply;

    mapping(uint256 => string) private s_tokenURIs;

    event Mint(uint amount, address indexed minter, uint256 indexed tokenId);
    event Withdraw(uint amount, address indexed withdrawer);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmount,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        s_cost = _cost;
        s_maxSupply = _maxSupply;
        s_maxMintAmount = _maxMintAmount;
        s_baseURI = _baseURI;
        s_totalSupply = 0;
    }

    function mint(uint256 _mintAmount) public payable {
        require(
            _mintAmount <= s_maxMintAmount,
            "Mint amount exceeds max amount"
        );
        require(_mintAmount > 0, "Mint amount must be greater than 0");

        uint256 totalCost = _mintAmount * s_cost;
        require(
            msg.value >= totalCost,
            "Ether value sent is not correct for mint amount"
        );

        uint256 supply = s_tokenIds.current();
        uint256 tokenId;

        for (uint256 i; i < _mintAmount; i++) {
            tokenId = supply + i;

            while (_exists(tokenId)) {
                tokenId++;
            }

            _mint(msg.sender, tokenId);
            s_totalSupply++;
        }
        emit Mint(_mintAmount, msg.sender, tokenId);
    }

    function tokenURI(
        uint _tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return
            string(
                abi.encodePacked(
                    s_baseURI,
                    _tokenId.toString(),
                    s_baseExtension
                )
            );
    }

    function setMaxMintAmount(uint _amount) external onlyOwner {
        s_maxMintAmount = _amount;
    }

    function setCost(uint _newCost) external onlyOwner {
        s_cost = _newCost;
    }

    function getMaxMintAmount() external view returns (uint256) {
        return s_maxMintAmount;
    }

    function getCost() external view returns (uint256) {
        return s_cost;
    }

    function getTotalSupply() external view returns (uint256) {
        return s_totalSupply;
    }

    function getMaxSupply() external view returns (uint) {
        return s_maxSupply;
    }

    function getBaseURI() external view returns (string memory) {
        return s_baseURI;
    }

    function getWalletOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        uint tokenCount = balanceOf(_owner);

        uint256[] memory ownedTokens = new uint256[](tokenCount);
        for (uint256 i; i < tokenCount; i++) {
            ownedTokens[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return ownedTokens;
    }

    function withdraw() external onlyOwner {
        uint balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");

        emit Withdraw(balance, msg.sender);
    }
}
