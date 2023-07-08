// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error Airdrop__AlreadyClaimed(address caller);
error Airdrop__NotInAllowList(address caller);
error Airdrop__ExceededAmount(address caller);

contract Airdrop is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private s_tokenCounter;

    IERC721 private s_nftContract;
    bytes32 public immutable i_root;
    string public s_nftTokenURIs;

    mapping(address => bool) public s_claimed;
    mapping(uint256 => bool) private s_exists;
    mapping(address => uint256) private s_tokenIds;
    mapping(address => uint256) private s_nftTokenAmount;
    mapping(uint256 => address) public s_tokenOwners;
    mapping(uint256 => string) public s_tokenURIs;
    mapping(address => bool) private s_approvedContracts;

    /**
     *
     * @dev This event will be emitted inside mintNFT function
     * @param owner Address of the owner of the NFT
     * @param tokenId ID of the minted NFT
     */
    event AirdropClaimed(address indexed owner, uint256 indexed tokenId);
    event TokenBurned(address indexed owner, uint256 indexed tokenId);

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
        s_nftContract = IERC721(_nftAddress);
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

        uint256 numTokensOwns = s_nftContract.balanceOf(msg.sender);

        require(numTokensOwns > 0, "Airdrop: You don't have any tokens");

        for (uint256 i = 0; i < numTokensOwns; i++) {
            uint256 tokenId = s_tokenCounter.current();

            _mint(msg.sender, s_tokenIds[msg.sender], 1, "");

            s_tokenOwners[tokenId] = msg.sender;

            s_tokenURIs[tokenId] = _generateTokenURI(msg.sender);

            s_claimed[msg.sender] = true;

            tokenId++;

            emit AirdropClaimed(msg.sender, tokenId);
        }
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

    function ownerOf(uint256 tokenId) external view returns (bool) {
        return balanceOf(msg.sender, tokenId) != 0;
    }

    function setApprovedContract(address _contractAddress) external onlyOwner {
        s_approvedContracts[_contractAddress] = true;
    }

    function revokeApproval(address _contractAddress) external onlyOwner {
        delete s_approvedContracts[_contractAddress];
    }

    function burn(uint256 tokenId) external {
        require(
            s_tokenOwners[tokenId] == msg.sender,
            "Airdrop: caller is not the owner of the token"
        );
        _burn(msg.sender, tokenId, 1);
        emit TokenBurned(msg.sender, tokenId);
    }

    function getTokenId(address _owner) external view returns (uint256) {
        return s_tokenIds[_owner];
    }

    function getNftBalance(address _owner) external view returns (uint256) {
        return s_nftTokenAmount[_owner];
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

    function uri(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(s_exists[_tokenId], "Airdrop: URI query for nonexistent token");
        return s_tokenURIs[_tokenId];
    }

    function _mint(
        address _to,
        uint256 _tokenId,
        uint256 _amount,
        bytes memory _data
    ) internal override {
        super._mint(_to, _tokenId, _amount, _data);
        s_exists[_tokenId] = true;
        s_tokenIds[_to] = _tokenId;
    }

    function _burn(
        address _owner,
        uint256 _tokenId,
        uint256 _amount
    ) internal override {
        super._burn(_owner, _tokenId, _amount);
        s_exists[_tokenId] = false;
        s_tokenIds[_owner] = 0;
    }

    function _setURI(string memory _uri) internal override {
        super._setURI(_uri);
    }
}
