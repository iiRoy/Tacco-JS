function encode(message) {
  let encodedMessage = "";

  for (let position = 0; position < message.length; position++) {
    const currentSymbol = message[position];
    const numericCode = currentSymbol.charCodeAt(0);

    if (numericCode >= 65 && numericCode <= 90) {
      encodedMessage += String.fromCharCode(
        (numericCode - 65 + 3) % 26 + 65
      );
    } else if (numericCode >= 97 && numericCode <= 122) {
      encodedMessage += String.fromCharCode(
        (numericCode - 97 + 3) % 26 + 97
      );
    } else {
      encodedMessage += currentSymbol;
    }
  }

  return encodedMessage;
}

const fileSystem = require("fs");
const sourceText = fileSystem.readFileSync("/dev/stdin", "utf8");

process.stdout.write(encode(sourceText));