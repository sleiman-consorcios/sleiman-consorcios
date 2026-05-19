import { calculateAge } from "./phone";

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  // Use the standard API URL format as requested
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
}

export function buildContactMessage(data: {
  name?: string; phone?: string; cpf?: string; birthDate?: string; objective?: string;
  creditRange?: string; installmentRange?: string;
  credit?: string; months?: string; installment?: string;
  hasLance?: string; message?: string; urgency?: string;
  income?: string;
  baseMessage?: string;
}): string {
  let msg = data.baseMessage ? `${data.baseMessage}\n\n` : "Olá, gostaria de uma simulação.\n\n";
  
  msg += `DADOS DO CLIENTE`;
  if (data.name) msg += `\nNome: ${data.name}`;
  if (data.phone) msg += `\nWhatsApp: ${data.phone}`;
  if (data.cpf) msg += `\nCPF: ${data.cpf}`;
  if (data.birthDate) {
    const age = calculateAge(data.birthDate);
    msg += `\nNascimento: ${data.birthDate} (${age} anos)`;
  }
  
  msg += `\n\nDETALHES DA SIMULAÇÃO`;
  if (data.objective) msg += `\nObjetivo: ${data.objective}`;
  if (data.credit) msg += `\nCrédito: ${data.credit}`;
  else if (data.creditRange) msg += `\nFaixa de crédito: ${data.creditRange}`;
  
  if (data.months) msg += `\nPrazo: ${data.months} meses`;
  
  if (data.installment) msg += `\nParcela: ${data.installment}`;
  else if (data.installmentRange) msg += `\nParcela desejada: ${data.installmentRange}`;
  
  if (data.hasLance) msg += `\nPossui lance: ${data.hasLance}`;
  if (data.urgency) msg += `\nUrgência: ${data.urgency}`;
  if (data.income) msg += `\nRenda: ${data.income}`;
  if (data.message) msg += `\nMensagem: ${data.message}`;
  
  msg += "\n\nOrigem: Landing Page Sleiman Consórcios";
  return msg;
}
