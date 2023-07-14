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
    Counters.Counter public s_tokenIds;

    address private s_owner;
    uint256 private s_cost = 0.01 ether;
    Airdrop private airdropInterface;
    mapping(address => mapping(uint256 => bool)) private s_isTokenBurned;
    mapping(address => uint256[]) private s_airdropTokens;
    mapping(address => uint256) private s_ownerWallet;
    mapping(address => mapping(uint256 => uint256))
        private s_airdropTokenAmount;

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
        uint256[] memory tokenIds = _airdropTokenId();
        uint256 balance = _getAirdropBalance(msg.sender, tokenIds);
        uint256 tokenId = tokenIds[0];

        if (
            balance > 0 &&
            tokenIds.length > 0 &&
            airdropInterface.ownerOf(tokenId) == msg.sender
        ) {
            require(
                !s_isTokenBurned[msg.sender][tokenId],
                "Token already burned"
            );

            airdropInterface.burn(msg.sender, tokenId, 1);

            balance--;
        } else {
            require(
                msg.value >= s_cost,
                "Ether value sent is not correct for mint amount"
            );
        }

        s_tokenIds.increment();
        uint256 newItemId = s_tokenIds.current();

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        s_ownerWallet[msg.sender] = newItemId;

        emit Mint(msg.sender, newItemId);
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

    function getAirdropTokens(
        address _owner
    ) external view returns (uint256[] memory) {
        uint256[] memory tokens = s_airdropTokens[_owner];
        return tokens;
    }

    function getAirdropAmount(address _owner) external view returns (uint256) {
        uint256 balance = _getAirdropBalance(_owner, _airdropTokenId());
        return balance;
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

    function _getAirdropBalance(
        address _owner,
        uint256[] memory _tokenIds
    ) internal view returns (uint256) {
        uint256 balance = 0;
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            if (!s_isTokenBurned[_owner][_tokenIds[i]]) {
                balance++;
            }
        }
        return balance;
    }

    function _isTokenBurned(
        address _owner,
        uint256 _tokenId
    ) internal view returns (bool) {
        return airdropInterface.balanceOf(_owner, _tokenId) == 0;
    }

    function _airdropTokenIds() internal view returns (uint256[] memory) {
        return s_airdropTokens[msg.sender];
    }

    function _burnAirdropToken(address _owner, uint256 _tokenId) internal {
        airdropInterface.burn(_owner, _tokenId, 1);

        uint256[] storage tokens = s_airdropTokens[_owner];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == _tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    function _airdropTokenId() internal view returns (uint256[] memory) {
        uint256[] memory tokenId = airdropInterface.getTokenId(msg.sender);
        uint256 currentTokenId = 0;

        for (uint256 i = 0; i < tokenId.length; i++) {
            if (!s_isTokenBurned[msg.sender][tokenId[i]]) {
                currentTokenId = tokenId[i];
                break;
            }
        }

        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = currentTokenId;

        return tokenIds;
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
