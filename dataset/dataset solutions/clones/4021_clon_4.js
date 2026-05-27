const analyzeValues = (sourceText) => {
  const numericStrings = sourceText.split('\n');
  let primaryDatum = Number(numericStrings[0]);
  const secondaryDatum = Number(numericStrings[1]);

  primaryDatum = (primaryDatum - 1) % 500 + 1;

  if (primaryDatum <= secondaryDatum) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

analyzeValues(require('fs').readFileSync('/dev/stdin', 'utf8'));
