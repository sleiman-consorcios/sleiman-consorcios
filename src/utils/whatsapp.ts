export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildContactMessage(data: {
  name?: string; phone?: string; objective?: string;
  creditRange?: string; installmentRange?: string;
  hasLance?: string; message?: string;
}): string {
  let msg = "Olá, gostaria de uma simulação.";
  if (data.name) msg += `\nNome: ${data.name}`;
  if (data.phone) msg += `\nWhatsApp: ${data.phone}`;
  if (data.objective) msg += `\nObjetivo: ${data.objective}`;
  if (data.creditRange) msg += `\nFaixa de crédito: ${data.creditRange}`;
  if (data.installmentRange) msg += `\nParcela desejada: ${data.installmentRange}`;
  if (data.hasLance) msg += `\nPossui lance: ${data.hasLance}`;
  if (data.message) msg += `\nMensagem: ${data.message}`;
  msg += "\n\nOrigem: Landing Page Sleiman Consórcios";
  return msg;
}
