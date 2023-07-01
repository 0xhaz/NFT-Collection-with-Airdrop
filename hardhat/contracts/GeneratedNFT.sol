// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "./Airdrop.sol";

contract GeneratedNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter public s_tokenIds;

    Airdrop private airdropInterface;
    mapping(address => bool) private s_isTokenBurned;

    event Mint(address indexed minter, uint256 indexed tokenId);

    constructor(
        address _airdropAddress,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        airdropInterface = Airdrop(_airdropAddress);
    }

    function mint(string memory _tokenURI) public {
        require(
            airdropInterface.ownerOf(msg.sender) == msg.sender,
            "GeneratedNFT: Caller is not the owner of the airdrop token"
        );
        require(
            !s_isTokenBurned[msg.sender],
            "GeneratedNFT: Airdrop token is already burned"
        );

        airdropInterface.burn(msg.sender);
        s_isTokenBurned[msg.sender] = true;

        s_tokenIds.increment();

        uint256 newItemId = s_tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        emit Mint(msg.sender, newItemId);
    }

    function isTokenBurned(address _owner) public view returns (bool) {
        return s_isTokenBurned[_owner];
    }

    function totalSupply() public view returns (uint256) {
        return s_tokenIds.current();
    }
}
