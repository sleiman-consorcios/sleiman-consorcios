export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const firstDigit = digits.slice(2, 3);
    return ddd[0] !== "0" && ddd[1] !== "0" && firstDigit === "9";
  }
  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    return ddd[0] !== "0" && ddd[1] !== "0";
  }
  return false;
}

export function isWhatsApp(value: string): Promise<boolean> {
  return new Promise((resolve) => {
    const isValid = isValidPhone(value);
    setTimeout(() => resolve(isValid), 400);
  });
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Let's be less strict for testing if needed, but this is a standard validation
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function isValidBirthDate(value: string): boolean {
  const dateStr = value.replace(/\D/g, "");
  if (dateStr.length !== 8) return false;

  const day = parseInt(dateStr.slice(0, 2));
  const month = parseInt(dateStr.slice(2, 4));
  const year = parseInt(dateStr.slice(4));

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
}

export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const dateStr = birthDate.replace(/\D/g, "");
  if (dateStr.length !== 8) return 0;

  const day = parseInt(dateStr.slice(0, 2));
  const month = parseInt(dateStr.slice(2, 4));
  const year = parseInt(dateStr.slice(4));

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() - (month - 1);
  if (m < 0 || (m === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}
