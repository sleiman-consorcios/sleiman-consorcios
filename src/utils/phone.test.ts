import { describe, it, expect } from "vitest";
import { formatPhone, isValidPhone, formatCPF, isValidCPF, calculateAge } from "./phone";

describe("Phone and Identification Utils", () => {
  describe("formatPhone", () => {
    it("should format mobile numbers correctly", () => {
      expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
    });
    it("should format landline numbers correctly", () => {
      expect(formatPhone("1133334444")).toBe("(11) 33334-444");
    });
  });

  describe("isValidPhone", () => {
    it("should validate a correct mobile number", () => {
      expect(isValidPhone("11988887777")).toBe(true);
    });
    it("should invalidate a number without leading 9 for 11 digits", () => {
      expect(isValidPhone("11888887777")).toBe(false);
    });
    it("should validate a 10-digit number", () => {
      expect(isValidPhone("1133334444")).toBe(true);
    });
  });

  describe("formatCPF", () => {
    it("should format CPF correctly", () => {
      expect(formatCPF("12345678901")).toBe("123.456.789-01");
    });
  });

  describe("isValidCPF", () => {
    it("should validate CPF correctly", () => {
      // 12345678909 IS actually valid algorithmically (last digits are 09)
      // Let's use an intentionally invalid one: 12345678900
      expect(isValidCPF("12345678900")).toBe(false); 
      expect(isValidCPF("00000000000")).toBe(false);
      // Valid CPF example: 529.982.247-25
      expect(isValidCPF("52998224725")).toBe(true);
    });
  });

  describe("calculateAge", () => {
    it("should calculate age correctly", () => {
      const today = new Date();
      const year = today.getFullYear() - 20;
      const birthDate = `0101${year}`;
      expect(calculateAge(birthDate)).toBe(20);
    });
  });
});
