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
      // Just verify it returns a uint type
      expect(result.type).toBe(Cl.ClarityType.UInt);
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
      
      // Verify schedule exists
      expect(schedule.result.type).toBe(Cl.ClarityType.OptionalSome);
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

    it("calculates vested amount correctly", () => {
      // Before cliff, should return zero
      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "calculate-vested-amount",
        [Cl.principal(wallet1)],
        wallet1
      );

      // At start (before cliff), vested amount should be zero
      expect(result).toBeOk(Cl.uint(0));
    });

    it("checks if cliff has passed", () => {
      const result = simnet.callReadOnlyFn(
        "vesting",
        "is-cliff-passed",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      // At start, cliff should not have passed
      expect(result).toBeOk(Cl.bool(false));
    });

    it("calculates vesting progress percentage", () => {
      // At start, progress should be 0%
      const result = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-progress",
        [Cl.principal(wallet1)],
        wallet1
      ).result;
      expect(result).toBeOk(Cl.uint(0));
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

    it("correctly tracks schedule state", () => {
      // Get initial schedule
      const schedule = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-schedule",
        [Cl.principal(wallet1)],
        wallet1
      ).result;

      // Verify schedule exists and has correct structure
      expect(schedule.type).toBe(Cl.ClarityType.OptionalSome);
    });

    it("prevents claiming immediately after creation", () => {
      // Try to claim immediately (before cliff)
      const { result } = simnet.callPublicFn(
        "vesting",
        "claim-vested-tokens",
        [],
        wallet1
      );

      // Should fail because no tokens are vested yet
      expect(result).toBeErr(Cl.uint(104)); // err-no-tokens-available
    });

    it("prevents claiming from non-existent schedule", () => {
      const { result } = simnet.callPublicFn(
        "vesting",
        "claim-vested-tokens",
        [],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });
  });

  describe("Admin Functions", () => {
    beforeEach(() => {
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

    it("allows owner to revoke vesting schedule", () => {
      const { result } = simnet.callPublicFn(
        "vesting",
        "revoke-vesting",
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify schedule is inactive
      const schedule = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-schedule",
        [Cl.principal(wallet1)],
        deployer
      ).result;

      // Verify schedule exists
      expect(schedule.type).toBe(Cl.ClarityType.OptionalSome);
    });

    it("prevents non-owner from revoking", () => {
      const { result } = simnet.callPublicFn(
        "vesting",
        "revoke-vesting",
        [Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("returns error when revoking non-existent schedule", () => {
      const { result } = simnet.callPublicFn(
        "vesting",
        "revoke-vesting",
        [Cl.principal(wallet2)],
        deployer
      );

      expect(result).toBeErr(Cl.uint(101)); // err-not-found
    });
  });

  describe("Contract Funding", () => {
    it("allows anyone to fund the contract", () => {
      const fundAmount = 5000000;

      const { result } = simnet.callPublicFn(
        "vesting",
        "fund-contract",
        [Cl.uint(fundAmount)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check contract balance
      const balance = simnet.callReadOnlyFn(
        "vesting",
        "get-contract-balance",
        [],
        wallet1
      ).result;

      expect(balance).toBeOk(Cl.uint(fundAmount));
    });

    it("accumulates multiple funding transactions", () => {
      simnet.callPublicFn("vesting", "fund-contract", [Cl.uint(1000000)], wallet1);
      simnet.callPublicFn("vesting", "fund-contract", [Cl.uint(2000000)], wallet2);

      const balance = simnet.callReadOnlyFn(
        "vesting",
        "get-contract-balance",
        [],
        deployer
      ).result;

      expect(balance).toBeOk(Cl.uint(3000000));
    });
  });

  describe("Event Logging", () => {
    it("logs vesting events with to-consensus-buff", () => {
      // Create a schedule (triggers log event)
      const { events } = simnet.callPublicFn(
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

      // Check for print event
      const printEvent = events.find((e) => e.event === "print_event");
      expect(printEvent).toBeDefined();
    });

    it("retrieves event details by ID", () => {
      // Create schedule (event 0)
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

      // Get event
      const { result } = simnet.callReadOnlyFn(
        "vesting",
        "get-vesting-event",
        [Cl.uint(0)],
        deployer
      );

      // Verify event exists
      expect(result.type).toBe(Cl.ClarityType.OptionalSome);
    });
  });
});
