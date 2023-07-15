// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

import "./Airdrop.sol";

contract GeneratedNFT is ERC721URIStorage, IERC1155Receiver, Ownable {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenIds;

    address private s_owner;
    uint256 private s_cost;
    Airdrop private airdropInterface;
    mapping(address => mapping(uint256 => bool)) private s_isTokenBurned;
    mapping(address => mapping(uint256 => uint256)) private s_airdropTokens;
    mapping(address => uint256) private s_ownerWallet;

    event Mint(address indexed minter, uint256 indexed tokenId);

    constructor(
        address _airdropAddress,
        string memory _name,
        string memory _symbol,
        uint256 _cost
    ) ERC721(_name, _symbol) {
        s_owner = msg.sender;
        airdropInterface = Airdrop(_airdropAddress);
        s_cost = _cost;
    }

    function mint(string memory _tokenURI) external payable {
        uint256 _balance = _getAirdropBalance(msg.sender);
        if (_balance > 0 && airdropInterface.isTokenExists(msg.sender)) {
            uint256 _tokenId = airdropInterface.getTokenId(msg.sender);

            // Check if the caller is the owner of the token or approved to transfer
            require(
                airdropInterface.isApprovedForAll(msg.sender, address(this)) ||
                    airdropInterface.ownerOf(_tokenId) == msg.sender,
                "GeneratedNFT: Caller is not owner nor approved"
            );

            airdropInterface.safeTransferFrom(
                msg.sender,
                address(this),
                _tokenId,
                1,
                ""
            );

            _balance--;
            s_airdropTokens[msg.sender][_tokenId] = _balance;
        } else {
            require(
                msg.value >= s_cost,
                "GeneratedNFT: Insufficient funds to mint"
            );
        }

        s_tokenIds.increment();
        uint256 _newTokenId = s_tokenIds.current();
        _mint(msg.sender, _newTokenId);
        _setTokenURI(_newTokenId, _tokenURI);
        s_ownerWallet[msg.sender] = _newTokenId;
        emit Mint(msg.sender, _newTokenId);
    }

    function setAirDropAddress(address _airdropAddress) external onlyOwner {
        airdropInterface = Airdrop(_airdropAddress);
    }

    function setCost(uint256 _cost) external onlyOwner {
        s_cost = _cost;
    }

    function getCost() external view returns (uint256) {
        return s_cost;
    }

    function isTokenBurned(
        address _owner,
        uint256 _tokenId
    ) external view returns (bool) {
        return _isTokenBurned(_owner, _tokenId);
    }

    function totalSupply() external view returns (uint256) {
        return s_tokenIds.current();
    }

    function getAirdropAddress() external view returns (address) {
        return address(airdropInterface);
    }

    function getOwnerWallet() external view returns (uint256) {
        return s_ownerWallet[msg.sender];
    }

    function getAirdropBalance(address _owner) external returns (uint256) {
        return _getAirdropBalance(_owner);
    }

    function _getAirdropBalance(address _owner) internal returns (uint256) {
        uint256 tokenId = airdropInterface.getTokenId(_owner);
        s_airdropTokens[_owner][tokenId] = airdropInterface.balanceOf(
            _owner,
            tokenId
        );
        uint256 balance = s_airdropTokens[_owner][tokenId];

        return balance;
    }

    function getAllWallets() external view returns (uint256[] memory) {
        uint256[] memory wallets = new uint256[](s_tokenIds.current());
        for (uint256 i = 0; i < wallets.length; i++) {
            wallets[i] = s_ownerWallet[ownerOf(i + 1)];
        }

        return wallets;
    }

    function _isTokenBurned(
        address _owner,
        uint256 _tokenId
    ) internal view returns (bool) {
        return airdropInterface.balanceOf(_owner, _tokenId) == 0;
    }

    function _airdropTokenIds(address _owner) internal view returns (uint256) {
        return airdropInterface.getTokenId(_owner);
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
