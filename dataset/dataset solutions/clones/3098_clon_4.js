function processInput(sourceText) {
  const lineData = sourceText.split('\n');
  const targetString = lineData[0];

  const pattern = /[ACGT]+/g;
  const matches = targetString.match(pattern);

  let ultimateLength = 0;

  if (matches) {
    ultimateLength = matches.reduce((currentMax, segment) => {
      return Math.max(currentMax, segment.length);
    }, 0);
  }

  console.log(ultimateLength);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
