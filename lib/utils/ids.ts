// lib/utils/ids.ts

const publicIdAlphabet = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const defaultPublicIdLength = 12;

function getCryptoValues(length: number): Uint8Array {
  const cryptoSource = globalThis.crypto;

  if (!cryptoSource) {
    throw new Error("Crypto API is not available in this runtime.");
  }

  const values = new Uint8Array(length);
  cryptoSource.getRandomValues(values);

  return values;
}

export function generatePublicId(length = defaultPublicIdLength): string {
  if (!Number.isInteger(length) || length < 8 || length > 32) {
    throw new Error("Public ID length must be an integer between 8 and 32.");
  }

  const randomValues = getCryptoValues(length);
  const characters = Array.from(randomValues, (value) => {
    const alphabetIndex = value % publicIdAlphabet.length;

    return publicIdAlphabet[alphabetIndex];
  });

  return characters.join("");
}

export function isValidPublicId(value: string): boolean {
  if (value.length < 8 || value.length > 32) {
    return false;
  }

  return Array.from(value).every((character) =>
    publicIdAlphabet.includes(character)
  );
}