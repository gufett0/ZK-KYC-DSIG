pragma solidity >=0.7.0 <0.9.0;

import "./Verifier.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract ZKIdentityVault is ReentrancyGuard, Ownable, Pausable {
    Groth16Verifier internal verifier;

    mapping(address => uint256) internal balances;

    mapping(address => bool) internal verified;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event IdentityProven(address indexed user);

    constructor(
        Groth16Verifier _verifier,
        address initialOwner
    ) Ownable(initialOwner) {
        verifier = _verifier;
    }

    function deposit() external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "No ETH sent");
        balances[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function proveIdentity(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[378] calldata _pubSignals
    ) external whenNotPaused {
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(isValid, "Invalid proof");

        verified[msg.sender] = true;
        emit IdentityProven(msg.sender);
    }

    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        require(verified[msg.sender], "Not verified");
        require(amount > 0, "Must withdraw > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");

        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function isVerified(address user) external view returns (bool) {
        return verified[user];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
