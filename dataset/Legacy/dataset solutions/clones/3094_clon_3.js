function determineComplementBase(base) {
  const basePairMap = {
    'A': 'T',
    'T': 'A',
    'C': 'G',
    'G': 'C'
  };
  const complementaryBase = basePairMap[base];
  return complementaryBase !== undefined ? complementaryBase : 'C';
}

function processInputData(rawInputString) {
  const targetChar = rawInputString;
  const complementResult = determineComplementBase(targetChar);
  console.log(complementResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
