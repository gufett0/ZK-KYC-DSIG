pragma solidity >=0.7.0 <0.9.0;

import "./Verifier.sol";

contract ZKIdentityVault {
    Groth16Verifier private verifier;

    mapping(address => uint256) private balances;

    mapping(address => bool) private verified;

    constructor(Groth16Verifier _verifier) {
        verifier = _verifier;
    }

    function deposit() external payable {
        require(msg.value > 0, "No ETH sent");
        balances[msg.sender] += msg.value;
    }

    function proveIdentity(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[378] calldata _pubSignals
    ) external {
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);

        require(isValid, "Invalid proof");

        verified[msg.sender] = true;
    }

    function withdraw(uint256 amount) external {
        require(verified[msg.sender], "Not verified");
        require(amount > 0, "Must withdraw > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");

        require(success, "ETH transfer failed");
    }

    function isVerified(address user) external view returns (bool) {
        return verified[user];
    }
}
