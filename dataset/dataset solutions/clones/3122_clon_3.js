const fsModule = require('fs');
const sourceText = fsModule.readFileSync('/dev/stdin', 'utf8');

console.log((payload => {
  const trimmedPayload = payload.trim();
  const rows = trimmedPayload.split('\n');
  const [lengthText, sourceString] = rows;

  const pieces = sourceString.split('');
  const letters = pieces.map(ch => {
    const codePoint = ch.charCodeAt();
    return codePoint - 97;
  });

  const counts = Array(26).fill(1);
  const MOD = 1e9 + 7;

  const multiplyMod = (left, right) => {
    const upper = left >> 16;
    const lower = left & 65535;
    const upperTerm = upper * right % MOD * 65536;
    const lowerTerm = lower * right;
    return (upperTerm + lowerTerm) % MOD;
  };

  for (let pos = 0; pos < lengthText; pos++) {
    const letterIndex = letters[pos];
    counts[letterIndex]++;
  }

  const foldedValue = counts.reduce(multiplyMod);
  const printableValue = foldedValue - 1;
  return `${printableValue}`;
})(sourceText));
