// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

contract Airdrop is ERC1155, ERC2771Context, Ownable {
    bytes32 private s_merkleRoot;
    IERC721 private s_nftContract;

    mapping(address => bool) private s_claimed;
    mapping(uint256 => bool) private s_exists;
    mapping(uint256 => string) private s_tokenURIs;

    event Claim(address indexed recipient, uint256 indexed tokenId);

    constructor(
        bytes32 _merkleRoot,
        address _trustedForwarder,
        address _nftContractAddress
    ) ERC1155("") ERC2771Context(_trustedForwarder) {
        s_merkleRoot = _merkleRoot;
        s_nftContract = IERC721(_nftContractAddress);
    }

    function claimAirdrop(
        uint256 _tokenId,
        bytes32[] calldata _merkleProof
    ) external {
        address _recipient = _msgSender();
        require(!s_claimed[_recipient], "Airdrop: Already claimed");
        require(
            _verifyProof(_merkleProof, _recipient),
            "Airdrop: Invalid proof"
        );
        require(
            _checkNftOwnership(_recipient, _tokenId),
            "Airdrop: Caller is not the owner of the NFT"
        );

        s_claimed[_recipient] = true;
        s_tokenURIs[_tokenId] = _generateTokenURI(_recipient);

        _mint(_recipient, _tokenId, 1, "");

        emit Claim(_recipient, _tokenId);
    }

    function ownerOf(address _recipient) external view returns (address) {
        require(s_claimed[_recipient], "Airdrop: Token not claimed");
        return _recipient;
    }

    function burn(address _recipient) external {
        require(
            _msgSender() == _recipient,
            "Airdrop: Caller is not the owner of the airdrop token"
        );
        require(s_claimed[_recipient], "Airdrop: Token is not claimed yet");
        require(
            !s_exists[uint256(uint160(_recipient))],
            "Airdrop: Token is already burned"
        );

        s_exists[uint256(uint160(_recipient))] = true;
        _burn(_recipient, uint256(uint160(_recipient)), 1);

        emit TransferSingle(
            _recipient,
            _recipient,
            address(0),
            uint256(uint160(_recipient)),
            1
        );
    }

    function _verifyProof(
        bytes32[] calldata _proof,
        address _recipient
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_recipient));
        return MerkleProof.verify(_proof, s_merkleRoot, leaf);
    }

    function _generateTokenURI(
        address _recipient
    ) internal view returns (string memory) {
        string memory baseURI = super.uri(0);
        return string(abi.encodePacked(baseURI, _recipient));
    }

    function uri(
        uint256 _tokenId
    ) public view override returns (string memory) {
        require(s_exists[_tokenId], "Airdrop: URI query for nonexistent token");
        return s_tokenURIs[_tokenId];
    }

    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        if (msg.sender == address(this)) {
            return ERC2771Context._msgSender();
        } else {
            return super._msgSender();
        }
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        if (msg.sender == address(this)) {
            return ERC2771Context._msgData();
        } else {
            return super._msgData();
        }
    }

    function _checkNftOwnership(
        address _owner,
        uint256 _tokenId
    ) internal view returns (bool) {
        return IERC721(s_nftContract).ownerOf(_tokenId) == _owner;
    }
}
