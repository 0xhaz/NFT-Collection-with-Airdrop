// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import "./Airdrop.sol";

contract GeneratedNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public s_tokenIds;

    address private s_owner;
    Airdrop private airdropInterface;
    mapping(address => bool) private s_isTokenBurned;
    mapping(address => uint256) private s_ownerWallet;

    event Mint(address indexed minter, uint256 indexed tokenId);

    constructor(
        address _airdropAddress,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        s_owner = msg.sender;
        airdropInterface = Airdrop(_airdropAddress);
    }

    function mint(string memory _tokenURI) public {
        uint256 tokenId = airdropInterface.getTokenId(msg.sender);

        address erc1155Owner = airdropInterface.ownerOf(tokenId);
        require(
            erc1155Owner == msg.sender,
            "GeneratedNFT: Caller does not own airdrop tokens"
        );
        require(
            tokenId != 0,
            "GeneratedNFT: Caller does not have airdrop tokens"
        );
        require(
            !s_isTokenBurned[msg.sender],
            "GeneratedNFT: Airdrop token is already burned"
        );

        airdropInterface.burn(tokenId);
        s_isTokenBurned[msg.sender] = true;

        s_tokenIds.increment();

        uint256 newItemId = s_tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        emit Mint(msg.sender, newItemId);
    }

    function setAirDropAddress(address _airdropAddress) external onlyOwner {
        airdropInterface = Airdrop(_airdropAddress);
    }

    function isTokenBurned(address _owner) public view returns (bool) {
        return s_isTokenBurned[_owner];
    }

    function totalSupply() public view returns (uint256) {
        return s_tokenIds.current();
    }

    function getAirdropAddress() external view returns (address) {
        return address(airdropInterface);
    }

    function getOwnerWallet() external view returns (uint256) {
        return s_ownerWallet[msg.sender];
    }

    function getAllWallets() external view returns (uint256[] memory) {
        uint256[] memory wallets = new uint256[](s_tokenIds.current());
        for (uint256 i = 0; i < wallets.length; i++) {
            wallets[i] = s_ownerWallet[ownerOf(i + 1)];
        }

        return wallets;
    }

    function airdropTokenId() internal view returns (uint256) {
        return airdropInterface.getTokenId(msg.sender);
    }
}
