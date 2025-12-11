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