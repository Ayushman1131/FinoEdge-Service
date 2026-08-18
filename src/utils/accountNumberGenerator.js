const crypto = require('crypto');
require("dotenv").config()

function feistelCipher(index) {

  const SECRET_KEY = process.env.CIPHER_SECRET_KEY;

  let left = (index >> 16) & 0xFFFF;
  let right = index & 0xFFFF;

  for (let round = 0; round < 4; round++) {
    const nextLeft = right;

    const hash = crypto.createHash('sha256')
      .update((right ^ SECRET_KEY ^ round).toString())
      .digest();
    const scramble = hash.readUInt16BE(0);

    const nextRight = left ^ scramble;
    left = nextLeft;
    right = nextRight;
  }

  return ((left << 16) | right) >>> 0;
}

function calculateLuhnDigit(numberStr) {
  let sum = 0;
  let shouldDouble = true;
  for (let i = numberStr.length - 1; i >= 0; i--) {
    let digit = parseInt(numberStr.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return ((10 - (sum % 10)) % 10).toString();
}

function generateAccountNumber(nextSequence) {
  const branchPrefix = "9102";

  const secureUniqueInt = feistelCipher(nextSequence);

  const scrambledCore = secureUniqueInt.toString().padStart(9, '0');
  const partialNum = branchPrefix + scrambledCore;

  const checkDigit = calculateLuhnDigit(partialNum);
  const finalAccountNumberString = partialNum + checkDigit;

  return BigInt(finalAccountNumberString);
}

module.exports = { generateAccountNumber };
