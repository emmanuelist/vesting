import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Token Vesting Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("Initialization", () => {
    it("ensures simnet is well initialised", () => {
      expect(simnet.blockHeight).toBeDefined();
    });

    it("returns correct current time using stacks-block-time", () => {
      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "get-current-time",
        [],
        deployer
      );
      expect(result).toBeUint(simnet.blockTime);
    });

    it("starts with zero vesting schedules", () => {
      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "get-total-schedules",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });
  });

  describe("Creating Vesting Schedules", () => {
    it("allows contract owner to create a vesting schedule", () => {
      const totalAmount = 1000000;
      const cliffDuration = 100; // blocks
      const vestingDuration = 500; // blocks

      const { result } = simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [
          Cl.principal(wallet1),
          Cl.uint(totalAmount),
          Cl.uint(cliffDuration),
          Cl.uint(vestingDuration),
        ],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify schedule was created
      const schedule = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-schedule",
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(schedule.result).toBeSome(
        Cl.tuple({
          "total-amount": Cl.uint(totalAmount),
          "claimed-amount": Cl.uint(0),
          "start-time": Cl.uint(simnet.blockTime),
          "cliff-duration": Cl.uint(cliffDuration),
          "vesting-duration": Cl.uint(vestingDuration),
          "is-active": Cl.bool(true),
        })
      );
    });

    it("prevents non-owner from creating vesting schedule", () => {
      const { result } = simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [
          Cl.principal(wallet2),
          Cl.uint(1000000),
          Cl.uint(100),
          Cl.uint(500),
        ],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("prevents creating duplicate vesting schedules", () => {
      // Create first schedule
      simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [
          Cl.principal(wallet1),
          Cl.uint(1000000),
          Cl.uint(100),
          Cl.uint(500),
        ],
        deployer
      );

      // Try to create duplicate
      const { result } = simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [
          Cl.principal(wallet1),
          Cl.uint(2000000),
          Cl.uint(200),
          Cl.uint(600),
        ],
        deployer
      );

      expect(result).toBeErr(Cl.uint(102)); // err-already-exists
    });

    it("validates schedule parameters", () => {
      // Zero amount
      let result = simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [Cl.principal(wallet1), Cl.uint(0), Cl.uint(100), Cl.uint(500)],
        deployer
      ).result;
      expect(result).toBeErr(Cl.uint(106)); // err-invalid-schedule

      // Cliff longer than vesting duration
      result = simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [Cl.principal(wallet2), Cl.uint(1000000), Cl.uint(600), Cl.uint(500)],
        deployer
      ).result;
      expect(result).toBeErr(Cl.uint(106)); // err-invalid-schedule
    });

    it("increments total vesting schedules counter", () => {
      simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [Cl.principal(wallet1), Cl.uint(1000000), Cl.uint(100), Cl.uint(500)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "get-total-schedules",
        [],
        deployer
      );
      expect(result).toBeOk(Cl.uint(1));
    });
  });

  describe("Vesting Calculations", () => {
    beforeEach(() => {
      // Create a vesting schedule: 1M tokens, 100 blocks cliff, 500 blocks vesting
      simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [
          Cl.principal(wallet1),
          Cl.uint(1000000),
          Cl.uint(100),
          Cl.uint(500),
        ],
        deployer
      );
    });

    it("returns zero vested amount before cliff", () => {
      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "calculate-vested-amount",
        [Cl.principal(wallet1)],
        wallet1
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns error for non-existent schedule", () => {
      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "calculate-vested-amount",
        [Cl.principal(wallet2)],
        wallet2
      );
      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });

    it("calculates linear vesting after cliff", () => {
      // Mine blocks to pass cliff and reach 50% vesting (250 blocks from start)
      simnet.mineEmptyBlocks(250);

      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "calculate-vested-amount",
        [Cl.principal(wallet1)],
        wallet1
      );

      // At 250 blocks: (1000000 * 250) / 500 = 500000
      expect(result).toBeOk(Cl.uint(500000));
    });

    it("returns all tokens after vesting period ends", () => {
      // Mine blocks to complete vesting (500+ blocks)
      simnet.mineEmptyBlocks(600);

      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "calculate-vested-amount",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1000000));
    });

    it("checks if cliff has passed", () => {
      let result = simnet.callReadOnlyFn(
        "vesting",
        "is-cliff-passed",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      expect(result).toBeOk(Cl.bool(false));

      // Mine blocks past cliff
      simnet.mineEmptyBlocks(150);

      result = simnet.callReadOnlyFn(
        "vesting",
        "is-cliff-passed",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      expect(result).toBeOk(Cl.bool(true));
    });

    it("calculates vesting progress percentage", () => {
      // At start
      let result = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-progress",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      expect(result).toBeOk(Cl.uint(0));

      // At 50% (250 blocks)
      simnet.mineEmptyBlocks(250);
      result = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-progress",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      expect(result).toBeOk(Cl.uint(50));

      // After completion (600 blocks)
      simnet.mineEmptyBlocks(400);
      result = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-progress",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      expect(result).toBeOk(Cl.uint(100));
    });
  });

  describe("Claiming Vested Tokens", () => {
    beforeEach(() => {
      // Create vesting schedule
      simnet.callPublicFn(
        "vesting",
        "create-vesting-schedule",
        [
          Cl.principal(wallet1),
          Cl.uint(1000000),
          Cl.uint(100),
          Cl.uint(500),
        ],
        deployer
      );

      // Fund the contract
      simnet.callPublicFn(
        "vesting",
        "fund-contract",
        [Cl.uint(2000000)],
        deployer
      );
    });

    it("prevents claiming before cliff", () => {
      const { result } = simnet.callPublicFn(
        "vesting",
        "claim-vested-tokens",
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(104)); // err-no-tokens-available
    });

    it("allows claiming after cliff period", () => {
      // Mine to 250 blocks (50% vested)
      simnet.mineEmptyBlocks(250);

      const { result } = simnet.callPublicFn(
        "vesting",
        "claim-vested-tokens",
        [],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(500000));

      // Verify claimed amount was updated
      const schedule = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-schedule",
        [Cl.principal(wallet1)],
        wallet1
      ).result;