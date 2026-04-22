const processData = (sourceText) => {
  let occurrenceTally = 0;
  const pattern = /ABC/g;
  let currentMatch;

  while ((currentMatch = pattern.exec(sourceText)) !== null) {
    occurrenceTally++;
  }

  console.log(occurrenceTally);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));