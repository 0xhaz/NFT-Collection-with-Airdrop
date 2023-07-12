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

    uint256 private s_cost;
    Airdrop private airdropInterface;
    mapping(address => mapping(uint256 => bool)) private s_isTokenBurned;
    mapping(address => uint256) private s_ownerWallet;
    mapping(address => mapping(uint256 => uint256))
        private s_airdropTokenAmount;

    event Mint(address indexed minter, uint256 indexed tokenId);

    modifier airdropOwner() {
        uint256 tokenId = airdropTokenId();
        require(
            airdropInterface.balanceOf(msg.sender, tokenId) > 0,
            "GeneratedNFT: There is no token to claim"
        );
        require(!isTokenBurned(msg.sender), "GeneratedNFT: Token is burned");
        _;
    }

    constructor(
        address _airdropAddress,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        s_owner = msg.sender;
        airdropInterface = Airdrop(_airdropAddress);
    }

    function mint(string memory _tokenURI) external {
        uint256 tokenId = airdropTokenId();
        uint256 balance = _getAirdropBalance(msg.sender);

        require(balance > 0, "GeneratedNFT: Not enough tokens");

        require(
            balance > s_airdropTokenAmount[msg.sender][tokenId],
            "GeneratedNFT: Token is burned"
        );

        if (balance > 0) {
            airdropInterface.burn(msg.sender, tokenId, 1);
            s_isTokenBurned[msg.sender][tokenId] = true;
            balance--;
        }
        console.log("balance: %s", balance);

        s_tokenIds.increment();
        uint256 newItemId = s_tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        s_ownerWallet[msg.sender] = newItemId;
        emit Mint(msg.sender, newItemId);
    }

    function setAirDropAddress(address _airdropAddress) external onlyOwner {
        airdropInterface = Airdrop(_airdropAddress);
    }

    function isTokenBurned(address _owner) public view returns (bool) {
        return s_isTokenBurned[_owner][airdropTokenId()];
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

    function _getAirdropBalance(
        address _owner
    ) internal view returns (uint256) {
        uint256 tokenId = airdropTokenId();
        return airdropInterface.balanceOf(_owner, tokenId);
    }

    function airdropTokenId() internal view returns (uint256) {
        return airdropInterface.getTokenId(msg.sender);
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
