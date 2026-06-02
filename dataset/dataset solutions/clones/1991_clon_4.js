function main(sequenceLength, inputString) {
  const charSequence = Array.from(inputString);

  const charCounts = charSequence.reduce((accumulator, char) => {
    accumulator[char] = (accumulator[char] || 0) + 1;
    return accumulator;
  }, {});

  const productOfCounts = (charCounts['R'] || 0) * (charCounts['G'] || 0) * (charCounts['B'] || 0);

  let invalidTripletsCount = 0;

  for (let firstIdx = 0; firstIdx < sequenceLength; ++firstIdx) {
    for (let commonDifference = 1; ; ++commonDifference) {
      const middleIdx = firstIdx + commonDifference;
      const lastIdx = firstIdx + 2 * commonDifference;

      if (lastIdx >= sequenceLength) {
        break;
      }

      const charA = charSequence[firstIdx];
      const charB = charSequence[middleIdx];
      const charC = charSequence[lastIdx];

      if (charA !== charB && charB !== charC && charA !== charC) {
        ++invalidTripletsCount;
      }
    }
  }
  console.log(productOfCounts - invalidTripletsCount);
}

const programInput = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

main(Number(programInput[0]), programInput[1]);
