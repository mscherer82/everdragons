pragma solidity ^0.4.0;

import "./../node_modules/everdragons-shared/solidity/interfaces/IERC721Receiver.sol";
import "./../node_modules/everdragons-shared/solidity/interfaces/IERC721.sol";
import "./../node_modules/everdragons-shared/solidity/libs/AddressUtils.sol";
import "./../node_modules/everdragons-shared/solidity/libs/ERC165.sol";
import "./EverDragonsFactory.sol";

contract EverDragonsERC721Token is EverDragonsFactory, ERC165, IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    using AddressUtils for address;

    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant ERC721_RECEIVED = 0x150b7a02;
    bytes4 private constant InterfaceId_ERC721 = 0x80ac58cd;

    // Mapping from token ID to owner
    mapping(uint256 => address) internal dragonIndexToOwner;
    // Mapping from token ID to approved address
    mapping(uint256 => address) internal dragonIndexToApproved;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) internal ownedTokens;
    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) internal ownedTokensIndex;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private operatorApprovals;

    constructor() public {
        // register the supported interfaces to conform to ERC721 via ERC165
        _registerInterface(InterfaceId_ERC721);
    }

    /**
    * @dev Guarantees msg.sender is owner of the given token
    * @param tokenId uint256 ID of the token to validate its ownership belongs to msg.sender
    */
    modifier onlyOwnerOf(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "sender must own token");
        _;
    }

    /**
    * @dev Gets the total amount of tokens stored by the contract
    * @return uint256 representing the total amount of tokens
    */
    function totalSupply() public view returns (uint256) {
        return DNAs.length;
    }

    /**
    * @dev Gets the balance of the specified address
    * @param owner address to query the balance of
    * @return uint256 representing the amount owned by the passed address
    */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "no owner addr");
        return ownedTokens[owner].length;
    }

    /**
     * @dev Returns whether the specified token exists
     * @param tokenId uint256 ID of the token to query the existence of
     * @return whether the token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        address owner = dragonIndexToOwner[tokenId];
        return owner != address(0);
    }

    /**
    * @dev Gets the owner of the specified token ID
    * @param tokenId uint256 ID of the token to query the owner of
    * @return owner address currently marked as the owner of the given token ID
    */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = dragonIndexToOwner[tokenId];
        require(owner != address(0), "no owner addr");
        return owner;
    }

    /**
    * @dev Gets the approved address to take ownership of a given token ID
    * @param tokenId uint256 ID of the token to query the approval of
    * @return address currently approved to take ownership of the given token ID
    */
    function approvedFor(uint256 tokenId) public view returns (address) {
        require(exists(tokenId));
        return dragonIndexToApproved[tokenId];
    }

    /**
    * @dev Tells whether the msg.sender is approved for the given token ID or not
    * This function is not private so it can be extended in further implementations like the operatable ERC721
    * @param owner address of the owner to query the approval of
    * @param tokenId uint256 ID of the token to query the approval of
    * @return bool whether the msg.sender is approved for the given token ID or not
    */
    function isApprovedFor(address owner, uint256 tokenId) internal view returns (bool) {
        return approvedFor(tokenId) == owner;
    }

    /**
    * @dev Gets the approved address for a token ID, or zero if no address set
    * Reverts if the token ID does not exist.
    * @param tokenId uint256 ID of the token to query the approval of
    * @return address currently approved for the given token ID
    */
    function getApproved(uint256 tokenId) public view returns (address) {
        return approvedFor(tokenId);
    }

    /**
    * @dev Sets or unsets the approval of a given operator
    * An operator is allowed to transfer all tokens of the sender on their behalf
    * @param to operator address to set the approval
    * @param approved representing the status of the approval to be set
    */
    function setApprovalForAll(address to, bool approved) public {
        require(to != msg.sender);
        operatorApprovals[msg.sender][to] = approved;
        emit ApprovalForAll(msg.sender, to, approved);
    }

    /**
     * @dev Tells whether an operator is approved by a given owner
     * @param owner owner address which you want to query the approval of
     * @param operator operator address which you want to query the approval of
     * @return bool whether the given operator is approved by the given owner
     */
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return operatorApprovals[owner][operator];
    }

    /**
    * @dev Transfers the ownership of a given token ID to another address
    * @param to address to receive the ownership of the given token ID
    * @param tokenId uint256 ID of the token to be transferred
    */
    function transfer(address to, uint256 tokenId) public onlyOwnerOf(tokenId) whenNotPaused {
        transferFrom(msg.sender, to, tokenId);
    }

    /**
    * @dev Approves another address to claim for the ownership of the given token ID
    * @param to address to be approved for the given token ID
    * @param tokenId uint256 ID of the token to be approved
    */
    function approve(address to, uint256 tokenId) public whenNotPaused {
        address owner = ownerOf(tokenId);
        require(to != owner, "don't approve yourself");
        require(canBeTransferred(tokenId), "dragon can't be transferred");
        require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "only owner or operator can approve");

        if (approvedFor(tokenId) != address(0) || to != address(0)) {
            dragonIndexToApproved[tokenId] = to;
            emit Approval(owner, to, tokenId);
        }
    }

    /**
    * @dev Claims the ownership of a given token ID
    * @param tokenId uint256 ID of the token being claimed by the msg.sender
    */
    function takeOwnership(uint256 tokenId) public whenNotPaused {
        transferFrom(ownerOf(tokenId), msg.sender, tokenId);
    }

    /// @notice Transfer a Kitty owned by another address, for which the calling address
    ///  has previously been granted transfer approval by the owner.
    /// @param from The address that owns the Kitty to be transfered.
    /// @param to The address that should take ownership of the Kitty. Can be any address,
    ///  including the caller.
    /// @param tokenId The ID of the Kitty to be transferred.
    /// @dev Required for ERC-721 compliance.
    function transferFrom(address from, address to, uint256 tokenId) public whenNotPaused {
        require(from != address(0), "from must be valid");
        require(to != address(0), "to must be valid");
        require(to != address(this), "don't transfert to contract");
        require(canBeTransferred(tokenId), "dragon can't be transferred");
        // Check for approval and valid ownership
        require(isApprovedOrOwner(msg.sender, tokenId), "must be approved");
        // require(ownerOf(tokenId) == from, "sender must own token");
        // Reassign ownership (also clears pending approvals and emits Transfer event).
        clearApprovalAndTransfer(from, to, tokenId);
    }

    /**
    * @dev Safely transfers the ownership of a given token ID to another address
    * @dev If the target address is a contract, it must implement `onERC721Received`,
    *  which is called upon a safe transfer, and return the magic value
    *  `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`; otherwise,
    *  the transfer is reverted.
    * @dev Requires the msg sender to be the owner, approved, or operator
    * @param from current owner of the token
    * @param to address to receive the ownership of the given token ID
    * @param tokenId uint256 ID of the token to be transferred
    */
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        // solium-disable-next-line arg-overflow
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
    * @dev Safely transfers the ownership of a given token ID to another address
    * @dev If the target address is a contract, it must implement `onERC721Received`,
    *  which is called upon a safe transfer, and return the magic value
    *  `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`; otherwise,
    *  the transfer is reverted.
    * @dev Requires the msg sender to be the owner, approved, or operator
    * @param from current owner of the token
    * @param to address to receive the ownership of the given token ID
    * @param tokenId uint256 ID of the token to be transferred
    * @param data bytes data to send along with a safe transfer check
    */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) public {
        transferFrom(from, to, tokenId);
        // solium-disable-next-line arg-overflow
        require(checkAndCallSafeTransfer(from, to, tokenId, data));
    }

    /**
    * @dev Internal function to clear current approval of a given token ID
    * @param tokenId uint256 ID of the token to be transferred
    */
    function clearApproval(address owner, uint256 tokenId) private {
        require(ownerOf(tokenId) == owner, "token must belong to owner");

        if (dragonIndexToApproved[tokenId] != address(0)) {
            dragonIndexToApproved[tokenId] = address(0);
            emit Approval(owner, address(0), tokenId);
        }
    }

    /**
    * @dev Internal function to clear current approval and transfer the ownership of a given token ID
    * @param from address which you want to send tokens from
    * @param to address which you want to transfer the token to
    * @param tokenId uint256 ID of the token to be transferred
    */
    function clearApprovalAndTransfer(address from, address to, uint256 tokenId) internal {
        clearApproval(from, tokenId);
        removeTokenFrom(from, tokenId);
        addTokenTo(to, tokenId);

        emit Transfer(from, to, tokenId);
    }

    /**
    * @dev Internal function to add a token ID to the list of a given address
    * @param to address representing the new owner of the given token ID
    * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
    */
    function addTokenTo(address to, uint256 tokenId) internal {
        require(dragonIndexToOwner[tokenId] == address(0), "current addr must be empty");
        dragonIndexToOwner[tokenId] = to;

        uint256 length = ownedTokens[to].length;
        ownedTokens[to].push(tokenId);
        ownedTokensIndex[tokenId] = length;
    }

    /**
    * @dev Internal function to remove a token ID from the list of a given address
    * @param from address representing the previous owner of the given token ID
    * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
    */
    function removeTokenFrom(address from, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "from addr must be token ownder");
        dragonIndexToOwner[tokenId] = address(0);

        // To prevent a gap in the array, we store the last token in the index of the token to delete, and
        // then delete the last slot.
        uint256 tokenIndex = ownedTokensIndex[tokenId];
        uint256 lastTokenIndex = ownedTokens[from].length > 0 ? ownedTokens[from].length - 1 : 0;
        uint256 lastToken = ownedTokens[from][lastTokenIndex];

        ownedTokens[from][tokenIndex] = lastToken;
        // This also deletes the contents at the last position of the array
        ownedTokens[from].length--;

        // Note that this will handle single-element arrays. In that case, both tokenIndex and lastTokenIndex are going to
        // be zero. Then we can make sure that we will remove tokenId from the ownedTokens list since we are first swapping
        // the lastToken to the first position, and then dropping the element placed in the last position of the list
        ownedTokensIndex[tokenId] = 0;
        ownedTokensIndex[lastToken] = tokenIndex;
    }

    /**
    * @dev Returns whether the given spender can transfer a given token ID
    * @param spender address of the spender to query
    * @param tokenId uint256 ID of the token to be transferred
    * @return bool whether the msg.sender is approved for the given token ID,
    *  is an operator of the owner, or is the owner of the token
    */
    function isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        // Disable solium check because of
        // https://github.com/duaraghav8/Solium/issues/175
        // solium-disable-next-line operator-whitespace
        return (spender == owner || approvedFor(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    /**
    * @dev Internal function to invoke `onERC721Received` on a target address
    * @dev The call is not executed if the target address is not a contract
    * @param from address representing the previous owner of the given token ID
    * @param to target address that will receive the tokens
    * @param tokenId uint256 ID of the token to be transferred
    * @param data bytes optional data to send along with the call
    * @return whether the call correctly returned the expected magic value
    */
    function checkAndCallSafeTransfer(address from, address to, uint256 tokenId, bytes data) internal returns (bool) {
        if (!to.isContract()) {
            return true;
        }
        bytes4 retval = IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data);
        return (retval == ERC721_RECEIVED);
    }

    /**
    * @dev Internal function to mint a new token
    * @dev Reverts if the given token ID already exists
    * @param to The address that will own the minted token
    * @param tokenId uint256 ID of the token to be minted by the msg.sender
    */
    function mint(address to, uint256 tokenId) internal {
        require(to != address(0), "addr must not be empty");
        addTokenTo(to, tokenId);
        emit Transfer(address(0), to, tokenId);
    }

    /**
    * @dev Internal function to burn a specific token
    * @dev Reverts if the token does not exist
    * @param tokenId uint256 ID of the token being burned by the msg.sender
    */
    function burn(address owner, uint256 tokenId) internal {
        clearApproval(owner, tokenId);
        removeTokenFrom(owner, tokenId);
        emit Transfer(owner, address(0), tokenId);
    }

    /**
    * @dev Gets the token ID at a given index of the tokens list of the requested owner
    * @param owner address owning the tokens list to be accessed
    * @param index uint256 representing the index to be accessed of the requested tokens list
    * @return uint256 token ID at the given index of the tokens list owned by the requested address
    */
    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
        require(index < balanceOf(owner));
        return ownedTokens[owner][index];
    }

    function canBeTransferred(uint256 tokenId) public view returns (bool) {
        Dragon storage dragon = dnaToDragon[uint64(tokenId)];
        if (dragon.state & 0x01 == 0) {
            IGenerator generator = IGenerator(registrar.getGenerator(uint8(tokenId & 0xFF)));
            return !generator.isSoulBound(uint96(tokenId), dragon.attributes, dragon.experience, dragon.prestige);
        } else {
            return false;
        }
    }

    function name() external view returns (string memory) {
        return "EverDragons";
    }

    function symbol() external view returns (string memory) {
        return "ED";
    }
}
