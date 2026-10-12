function processInputData(sourceContent) {
  const lineSegments = sourceContent.split("\n");
  const uniqueSet = new Set();

  for (let k = 1; k < lineSegments.length; k++) {
    uniqueSet.add(lineSegments[k]);
  }

  console.log(uniqueSet.size);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
