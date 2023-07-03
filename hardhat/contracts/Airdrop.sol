// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error Airdrop__AlreadyClaimed(address caller);
error Airdrop__NotInAllowList(address caller);

contract Airdrop is ERC1155, Ownable {
    bytes32 public immutable i_root;
    string public s_nftTokenURIs;
    uint256 public s_tokenCounter;

    mapping(address => bool) public s_claimed;
    mapping(uint256 => bool) private s_exists;
    mapping(uint256 => address) public s_tokenOwners;
    mapping(address => uint256) public s_tokenIds;
    mapping(uint256 => string) public s_tokenURIs;

    event AirdropClaimed(address indexed owner, uint256 indexed tokenId);
    event TokenBurned(address indexed owner, uint256 indexed tokenId);

    /**
     *
     * @dev This event will be emitted inside mintNFT function
     * @param owner Address of the owner of the NFT
     * @param tokenId ID of the minted NFT
     */

    event NFTMinted(address indexed owner, uint256 indexed tokenId);

    /**
     *
     * @param _root Merkle root of the airdrop
     * @param _nftTokenURIs NFT token URIs
     */

    constructor(bytes32 _root, string memory _nftTokenURIs) ERC1155("") {
        i_root = _root;
        s_nftTokenURIs = _nftTokenURIs;
        s_tokenCounter = 0;
    }

    /**
     *
     * @dev This function will mint NFTs to the caller
     * @param _proof will be the hex value of the proof with the give caller address generated from the merkle tree
     *
     */

    function claimAirdrop(bytes32[] memory _proof) external {
        if (s_claimed[msg.sender]) {
            revert Airdrop__AlreadyClaimed(msg.sender);
        }
        if (!_verifyProof(_proof)) {
            revert Airdrop__NotInAllowList(msg.sender);
        }

        s_claimed[msg.sender] = true;

        uint256 tokenId = s_tokenCounter;

        s_tokenOwners[tokenId] = msg.sender;
        s_tokenCounter += 1;

        _mint(msg.sender, tokenId, 1, "");
        s_tokenURIs[tokenId] = _generateTokenURI(msg.sender);

        emit AirdropClaimed(msg.sender, tokenId);
    }

    function canClaim(
        address _owner,
        bytes32[] calldata _proof
    ) external view returns (bool) {
        return
            !s_claimed[_owner] &&
            MerkleProof.verify(
                _proof,
                i_root,
                keccak256(abi.encodePacked(_owner))
            );
    }

    function ownerOf(uint256 _tokenId) external view returns (address) {
        require(s_claimed[msg.sender], "Airdrop: Token not claimed");
        return s_tokenOwners[_tokenId];
    }

    function burn(uint256 _tokenId) external {
        require(
            s_tokenOwners[_tokenId] == msg.sender,
            "Airdrop: Caller is not the owner of the airdrop token"
        );

        s_exists[_tokenId] = false;
        _burn(msg.sender, _tokenId, 1);

        emit TokenBurned(msg.sender, _tokenId);
    }

    function getTokenId(address _owner) external view returns (uint256) {
        return s_tokenIds[_owner];
    }

    function getClaimedAddress(address _address) external view returns (bool) {
        return s_claimed[_address];
    }

    /**
     *
     * @param _proof will be the hex value of the proof with the give caller address generated from the merkle tree
     *
     */

    function _verifyProof(
        bytes32[] memory _proof
    ) internal view returns (bool) {
        return
            MerkleProof.verify(
                _proof,
                i_root,
                keccak256(abi.encodePacked(msg.sender))
            );
    }

    function _generateTokenURI(
        address _owner
    ) internal view returns (string memory) {
        string memory baseURI = super.uri(0);
        return string(abi.encodePacked(baseURI, _owner));
    }
}
