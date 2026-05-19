function fetchSourceText() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

const alphabetSequence = Array.from({ length: 26 }, (_, idx) => String.fromCharCode(97 + idx));

const characterTally = new Map();
const rawInput = fetchSourceText();

for (const inputChar of rawInput) {
    const lowerChar = inputChar.toLowerCase();
    const charCode = lowerChar.charCodeAt(0);

    if (charCode >= 97 && charCode <= 122) {
        characterTally.set(lowerChar, (characterTally.get(lowerChar) || 0) + 1);
    }
}

for (const currentLetter of alphabetSequence) {
    const count = characterTally.get(currentLetter) || 0;
    console.log(`${currentLetter} : ${count}`);
}
