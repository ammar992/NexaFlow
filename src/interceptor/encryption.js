import CryptoJS from "crypto-js";

export const handleEncrypt = (message) => {
  const encrypted = CryptoJS.AES.encrypt(
    message,
    ACCESS_TOKEN_SECRET
  ).toString();
  return encrypted;
};
export const handleDecrypt = (encryptedMessage) => {
  if (encryptedMessage) {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedMessage,
      ACCESS_TOKEN_SECRET
    ).toString(CryptoJS.enc.Utf8);
    return decrypted;
  }
};

const ACCESS_TOKEN_SECRET = `_Xpdx@345xsfefe!@#`;
