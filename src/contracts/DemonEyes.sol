// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DemonEyes is ERC721Enumerable, Ownable {
    using Strings for uint256;
    using SafeMath for uint256;

    uint256 public constant MAX_MINT_AMOUNT = 2;
    uint256 public constant MAX_SUPPLY = 25;

    string private _tokenBaseURI;
    string private _notRevealedUri;

    bool public isActive = false;
    uint256 public cost = 0.02 ether;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initNotRevealedUri
    ) ERC721(_name, _symbol) {
        setNotRevealedURI(_initNotRevealedUri);
    }

    // @Dev Internal Functions
    function _baseURI() internal view virtual override returns (string memory) {
        return _tokenBaseURI;
    }

    // @Dev Public Functions
    function mint(uint256 _mintAmount) public payable {
        require(isActive, "Mint is not activate");
        require(_mintAmount > 0, "Not enough amount");
        require(
            _mintAmount <= MAX_MINT_AMOUNT,
            "You can mint only two token per wallet"
        );
        require(
            totalSupply().add(_mintAmount) <= MAX_SUPPLY,
            "All tokens have been minted"
        );

        if (msg.sender != owner()) {
            require(
                msg.value >= cost.mul(_mintAmount),
                "Ether value sent is not correct"
            );
        }

        for (uint256 i = 0; i < _mintAmount; i++) {
            uint256 tokenId = totalSupply().add(1);
            _safeMint(msg.sender, tokenId);
        }
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        // @Dev Check if token exist
        require(_exists(tokenId), "Token does not exist");

        string memory revealedBaseURI = _baseURI();
        return
            bytes(revealedBaseURI).length > 0
                ? string(abi.encodePacked(revealedBaseURI, tokenId.toString()))
                : string(abi.encodePacked(_notRevealedUri, tokenId.toString()));
    }

    // @Dev Only Owner Functions
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        _notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        _tokenBaseURI = _newBaseURI;
    }

    function setIsActive(bool _isActive) public onlyOwner {
        isActive = _isActive;
    }

    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }
}
