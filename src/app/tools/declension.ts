export function declension(num: number, forms: string[]) {
  num = Math.abs(num) % 100;
  const remainder = num % 10;
  if (num > 10 && num < 20) {
    return forms[2];
  }

  if (remainder > 1 && remainder < 5) {
    return forms[1];
  }

  if (remainder === 1) {
    return forms[0];
  }

  return forms[2];
}
