import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ZKIdentityVault", function () {
  async function deployZKVaultFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();

    const ZKVault = await hre.ethers.getContractFactory("ZKIdentityVault");
    const vault = await ZKVault.deploy(await verifier.getAddress(), owner.address);

    return { vault, verifier, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { vault, owner } = await loadFixture(deployZKVaultFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  describe("Identity Proof Verification", function () {
    it("Should accept a valid proof", async function () {
      const { vault, otherAccount } = await loadFixture(deployZKVaultFixture);

      const proof = {
        pi_a: [
          "1500394588316545386807377332533750033735999845471277564910684354229734599693",
          "8939901782008821808452062052186471187129894788606723424904340348103333189969",
          "1"
        ],
        pi_b: [
          [
            "16137862204434249396217983852981599566214174211518379581017436211978352468393",
            "15748134631697544616142657427381774330563966616226510236986617242981818293367"
          ],
          [
            "16151820293189862910473912268730501408382244964167246524886869198667350988958",
            "12725180396466557868167444272752746307907210087930370093659342680559882028424"
          ],
          [
            "1",
            "0"
          ]
        ],
        pi_c: [
          "5372718312284878257247198975042677383708567051200562194190057330240760648663",
          "3676877550145343011868676162223730273775921043521902090283023670223528515048",
          "1"
        ]
      };

      const proof_a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const proof_b = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])]
      ];
      const proof_c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

      const publicSignals = [
        "184","23","76","29","96","119","1","226","177","57","124","245",
        "214","158","45","79","52","149","47","93","221","76","238","150",
        "187","158","13","214","82","188","84","205",
        "2093067840402510428801745944150729051",
        "875053064801613544752441480679662590",
        "1682209073896252830709243051376992689",
        "596212952540570020647292960993736816",
        "2653935777733758630237518154719670409",
        "2472343769405067689159431613108274655",
        "1891641166069203963429329034293325995",
        "20758502348249411372394449008957946",
        "1038491939993993674737756563463815429",
        "1530029507053049441818179093582304434",
        "2355024259473774913032813360869942650",
        "1980552225992156698526149725150073455",
        "2050066957555104921151462925401303370",
        "1674363568606710529040998957519289243",
        "1909214576741777222041061488073516788",
        "1900120767381070617565138662905177851",
        "3476245653476836131798058351428729",
        "673281244893689398215496648014417607",
        "1491567185481274534787882845604477431",
        "397578656409969757763540871080209283",
        "1781979890604580756163009455059298491",
        "1294334653040409811098858461503465367",
        "809320160927360542725200966302690286",
        "2537531029508174279422765565834827528",
        "566051903869288314929647203564508294",
        "436033622552501399701779401110327356",
        "455272893668846771702339728667622944",
        "1323862747052037930504619166195745207",
        "1405153908870250999616768413036714115",
        "909734568624963160151498142414614546",
        "2411076930270486787392828542265982567",
        "980288304591466991149027393657816545",
        "907985380031888628733597134781893536",
        "4613558540681852741558361435048641"
      ].map(n => BigInt(n));

      await expect(vault.connect(otherAccount).proveIdentity(
        proof_a,
        proof_b,
        proof_c,
        publicSignals,
        {
          gasLimit: 3000000 
        }
      )).to.not.be.reverted;

      expect(await vault.isVerified(otherAccount.address)).to.be.true;
    });

    it("Should reject an invalid proof", async function () {
      const { vault, otherAccount } = await loadFixture(deployZKVaultFixture);

      const proof_a = [BigInt(1), BigInt(2)];
      const proof_b = [
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)]
      ];
      const proof_c = [BigInt(7), BigInt(8)];

      const invalidPublicSignals = Array(66).fill(BigInt(1));

      await expect(vault.connect(otherAccount).proveIdentity(
        proof_a,
        proof_b,
        proof_c,
        invalidPublicSignals,
        {
          gasLimit: 3000000
        }
      )).to.be.revertedWith("Invalid proof");

      expect(await vault.isVerified(otherAccount.address)).to.be.false;
    });
  });
});