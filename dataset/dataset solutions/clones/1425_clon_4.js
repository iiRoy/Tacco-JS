const acquireInputData = () => {
  return require('node:fs').readFileSync('/dev/stdin', 'utf8');
};

const charRegistry = new Set();
for (let i = 0; i < 26; i++) {
  charRegistry.add(String.fromCharCode(97 + i)); // Populate with 'a' through 'z'
}

const occurrenceMap = new Map();
const rawContent = acquireInputData();

for (const charUnit of rawContent) {
  const charCodeVal = charUnit.charCodeAt(0);
  let convertedChar = charUnit;

  if (charCodeVal >= 65 && charCodeVal <= 90) { // If character is an uppercase letter (A-Z)
    convertedChar = String.fromCharCode(charCodeVal + 32); // Convert to lowercase
  }

  if (charRegistry.has(convertedChar)) {
    occurrenceMap.set(convertedChar, (occurrenceMap.get(convertedChar) || 0) + 1);
  }
}

const displayAlphabet = [];
for (let i = 0; i < 26; i++) {
  displayAlphabet.push(String.fromCharCode(97 + i)); // Generate 'a' through 'z' for display order
}

for (const currentAlphaChar of displayAlphabet) {
  const currentCount = occurrenceMap.has(currentAlphaChar) ? occurrenceMap.get(currentAlphaChar) : 0;
  console.log(`${currentAlphaChar} : ${currentCount}`);
}