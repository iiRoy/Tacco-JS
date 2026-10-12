function rotateCode(characterCode, alphabetStart) {
  const relativePosition =
    characterCode - alphabetStart;

  const rotatedPosition =
    (relativePosition + 3) % 26;

  return alphabetStart + rotatedPosition;
}

function transformCharacter(character) {
  const characterCode = character.charCodeAt(0);
  let transformedCode;

  const isUppercase =
    characterCode >= 65 &&
    characterCode <= 90;

  const isLowercase =
    characterCode >= 97 &&
    characterCode <= 122;

  if (isUppercase) {
    transformedCode = rotateCode(
      characterCode,
      65
    );
  } else if (isLowercase) {
    transformedCode = rotateCode(
      characterCode,
      97
    );
  } else {
    return character;
  }

  return String.fromCharCode(transformedCode);
}

function encryptMessage(message) {
  const transformedCharacters = [];
  let position = 0;

  while (position < message.length) {
    const transformedCharacter =
      transformCharacter(message[position]);

    transformedCharacters.push(
      transformedCharacter
    );

    position += 1;
  }

  return transformedCharacters.join("");
}

const fs = require("fs");
const message = fs.readFileSync(
  "/dev/stdin",
  "utf8"
);

const encryptedMessage =
  encryptMessage(message);

process.stdout.write(encryptedMessage);