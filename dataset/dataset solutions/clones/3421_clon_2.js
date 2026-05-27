function processInput(rawData) {
  const parsedValue = parseInt(rawData, 10);

  if (parsedValue === 3 || 5 || 7) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
