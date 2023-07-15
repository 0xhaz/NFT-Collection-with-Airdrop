// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "hardhat/console.sol";

error Airdrop__AlreadyClaimed(address caller);
error Airdrop__NotInAllowList(address caller);
error Airdrop__ExceededAmount(address caller);

contract Airdrop is ERC1155, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private s_tokenCounter;

    IERC721Enumerable private s_nftContract;
    bytes32 public i_root;
    string private s_nftTokenURIs;

    mapping(address => bool) public s_claimed;
    mapping(uint256 => bool) private s_exists;
    mapping(address => uint256) private s_tokenIds;
    mapping(address => uint256) private s_airdropTokens;
    mapping(address => mapping(uint256 => uint256)) private s_nftTokenAmount;
    mapping(uint256 => address) public s_tokenOwners;
    mapping(uint256 => string) private s_tokenURIs;
    mapping(address => bool) private s_approvedContracts;

    /**
     *
     * @dev This event will be emitted inside mintNFT function
     * @param owner Address of the owner of the NFT
     * @param tokenId ID of the minted NFT
     */
    event AirdropClaimed(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 amount
    );

    /**
     *
     * @param _root Merkle root of the airdrop
     * @param _nftTokenURIs NFT token URIs
     * @param _nftAddress Address of the NFT contract
     */

    constructor(
        bytes32 _root,
        string memory _nftTokenURIs,
        address _nftAddress
    ) ERC1155("") {
        i_root = _root;
        s_nftTokenURIs = _nftTokenURIs;
        s_nftContract = IERC721Enumerable(_nftAddress);

        /**
         *
         * @dev looping through all the NFTs and storing the amount of NFTs each address owns
         * in the s_nftTokenAmount mapping
         */
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

        uint256 numTokensToClaim = s_nftContract.balanceOf(msg.sender);

        require(numTokensToClaim > 0, "Airdrop: No tokens to claim");

        _mint(msg.sender, 0, numTokensToClaim, "");

        s_tokenIds[msg.sender] = 0;
        s_tokenOwners[0] = msg.sender;
        s_tokenURIs[0] = _generateTokenURI(msg.sender);
        s_exists[0] = true;
        s_airdropTokens[msg.sender] = numTokensToClaim;

        emit AirdropClaimed(msg.sender, 0, numTokensToClaim);

        s_claimed[msg.sender] = true;
    }

    function canClaim(bytes32[] calldata _proof) external view returns (bool) {
        return
            !s_claimed[msg.sender] &&
            MerkleProof.verify(
                _proof,
                i_root,
                keccak256(abi.encodePacked(msg.sender))
            );
    }

    function getNftBalance(address _address) external view returns (uint256) {
        return s_nftContract.balanceOf(_address);
    }

    function getClaimStatus(address _address) external view returns (bool) {
        return s_claimed[_address];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return s_tokenOwners[tokenId];
    }

    function setApprovedContract(address _contractAddress) external onlyOwner {
        s_approvedContracts[_contractAddress] = true;
    }

    function setMerkleRoot(bytes32 _root) external onlyOwner {
        i_root = _root;
    }

    function revokeApproval(address _contractAddress) external onlyOwner {
        delete s_approvedContracts[_contractAddress];
    }

    function getTokenId(address _owner) external view returns (uint256) {
        return s_tokenIds[_owner];
    }

    function isTokenExists(address _owner) external view returns (bool) {
        uint tokenId = s_tokenIds[_owner];
        return s_exists[tokenId];
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

    function _beforeTokenTransfer(
        address _operator,
        address _from,
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) internal override {
        super._beforeTokenTransfer(
            _operator,
            _from,
            _to,
            _ids,
            _amounts,
            _data
        );

        if (_from == address(0)) {
            return;
        }

        if (_to != address(0) && !s_approvedContracts[_to]) {
            revert("Airdrop: transfer to non approved contract");
        }
    }

    function _mint(
        address _to,
        uint256[] memory _tokenIds,
        uint256 _amount,
        bytes memory _data
    ) internal {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            super._mint(_to, _tokenIds[i], _amount, _data);
            s_exists[_tokenIds[i]] = true;
        }
    }
}
