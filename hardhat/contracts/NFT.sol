// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string private s_baseExtension = ".json";
    uint256 private s_cost;
    uint256 private s_maxSupply;
    uint256 private s_maxMintAmount;
    string private s_baseURI;

    event Mint(uint amount, address indexed minter);
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
    }

    function mint(uint256 _mintAmount) public payable {
        require(_mintAmount <= s_maxMintAmount);
        require(_mintAmount >= s_cost);
        require(msg.value >= s_cost * _mintAmount);

        uint256 supply = totalSupply();
        uint256 tokenId;

        for (uint256 i; i < _mintAmount; i++) {
            tokenId = supply + i + 1;

            while (_exists(tokenId)) {
                tokenId++;
            }

            _safeMint(msg.sender, tokenId);
        }

        emit Mint(_mintAmount, msg.sender);
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

    function getMaxMintAmount() external view returns (uint) {
        return s_maxMintAmount;
    }

    function getCost() external view returns (uint) {
        return s_cost;
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
