import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl, buildContactMessage } from "./whatsapp";

describe("WhatsApp Utils", () => {
  describe("buildWhatsAppUrl", () => {
    it("should generate a correct WhatsApp URL", () => {
      const phone = "11999998888";
      const message = "Olá Mundo";
      const url = buildWhatsAppUrl(phone, message);
      expect(url).toContain("phone=11999998888");
      expect(url).toContain("text=Ol%C3%A1%20Mundo");
    });
  });

  describe("buildContactMessage", () => {
    it("should generate a message with all provided data", () => {
      const data = {
        name: "João Silva",
        phone: "11999998888",
        objective: "Imóvel",
        credit: "R$ 200.000,00"
      };
      const msg = buildContactMessage(data);
      expect(msg).toContain("Nome: João Silva");
      expect(msg).toContain("WhatsApp: 11999998888");
      expect(msg).toContain("Objetivo: Imóvel");
      expect(msg).toContain("Crédito: R$ 200.000,00");
    });
  });
});
