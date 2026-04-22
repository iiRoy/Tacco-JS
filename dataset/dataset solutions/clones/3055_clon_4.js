const calculateFlippages = (seq, index, currentA, currentB) => {
  if (index === seq.length) {
    return Math.min(currentA, currentB);
  }

  const value = Number(seq[index]);
  const targetA_val = index % 2; // Expected value for pattern 0101...
  const targetB_val = (index + 1) % 2; // Expected value for pattern 1010...

  const nextA = currentA + (value !== targetA_val);
  const nextB = currentB + (value !== targetB_val);

  return calculateFlippages(seq, index + 1, nextA, nextB);
};

const processInputString = (textData) => {
  const cleanedText = textData.trim();
  if (cleanedText.length === 0) {
    process.stdout.write("0");
    return;
  }
  process.stdout.write(calculateFlippages(cleanedText, 0, 0, 0).toString());
};

processInputString(require('fs').readFileSync('/dev/stdin', 'UTF-8'));