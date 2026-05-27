function processInput(rawData) {
  const trimmedData = rawData.trim();
  const charArray = Array.from(trimmedData);

  const charFrequencies = {};

  for (const char of charArray) {
    if (char === 'a' || char === 'b' || char === 'c') {
      charFrequencies[char] = (charFrequencies[char] || 0) + 1;
    }
  }

  const aCount = charFrequencies['a'] || 0;
  const bCount = charFrequencies['b'] || 0;
  const cCount = charFrequencies['c'] || 0;

  const allCountsAreOne = (aCount === 1 && bCount === 1 && cCount === 1);

  console.log(allCountsAreOne ? 'Yes' : 'No');
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
