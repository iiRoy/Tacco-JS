function encrypt(text) {
  let encrypted = "";

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    const code = character.charCodeAt(0);

    if (code >= 65 && code <= 90) {
      encrypted += String.fromCharCode(
        (code - 65 + 3) % 26 + 65
      );
    } else if (code >= 97 && code <= 122) {
      encrypted += String.fromCharCode(
        (code - 97 + 3) % 26 + 97
      );
    } else {
      encrypted += character;
    }
  }

  return encrypted;
}

const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf8");

process.stdout.write(encrypt(input));