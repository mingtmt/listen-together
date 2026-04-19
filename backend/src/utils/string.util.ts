import * as crypto from 'crypto';

/**
 * Generates a random short id string of the given length.
 *
 * The default length is 6 characters.
 *
 * The generated string is a hexadecimal representation of the random bytes.
 *
 * The string is uppercase.
 *
 * @param {number} [length=6] - The length of the generated id string.
 * @returns {string} - The generated short id string.
 */
export const generateShortId = (length: number = 6): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .substring(0, length)
    .toUpperCase();
};