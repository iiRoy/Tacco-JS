const transmission = require("fs")
    .readFileSync(0, "utf8")
    .trim();

let compressedMessage = "";
let sequenceCount = 0;
let activeCharacter = transmission[0];
let characterCount = 1;

for (let position = 1; position < transmission.length; position++) {
    const receivedCharacter = transmission[position];

    if (receivedCharacter === activeCharacter) {
        characterCount++;
    } else {
        compressedMessage += activeCharacter + characterCount;
        sequenceCount++;

        activeCharacter = receivedCharacter;
        characterCount = 1;
    }
}

if (transmission.length > 0) {
    compressedMessage += activeCharacter + characterCount;
    sequenceCount++;
}

console.log(compressedMessage);
console.log(sequenceCount);