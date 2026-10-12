const uppercaseOriginal =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const uppercaseEncrypted =
  "DEFGHIJKLMNOPQRSTUVWXYZABC";

const lowercaseOriginal =
  "abcdefghijklmnopqrstuvwxyz";

const lowercaseEncrypted =
  "defghijklmnopqrstuvwxyzabc";

function substituteCharacter(character) {
  const uppercasePosition =
    uppercaseOriginal.indexOf(character);

  if (uppercasePosition !== -1) {
    return uppercaseEncrypted[
      uppercasePosition
    ];
  }

  const lowercasePosition =
    lowercaseOriginal.indexOf(character);

  if (lowercasePosition !== -1) {
    return lowercaseEncrypted[
      lowercasePosition
    ];
  }

  return character;
}

function encryptWithSubstitution(text) {
  const result = [];

  for (const character of text) {
    result.push(
      substituteCharacter(character)
    );
  }

  return result.join("");
}

const fs = require("fs");
const plainText = fs.readFileSync(
  "/dev/stdin",
  "utf8"
);

const cipherText =
  encryptWithSubstitution(plainText);

process.stdout.write(cipherText);