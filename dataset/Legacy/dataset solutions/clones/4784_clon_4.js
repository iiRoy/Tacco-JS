function processInputAndGeneratePath(rawInput) {
  const numericValues = rawInput.split('\n')[0].match(/\d+/g).map(Number);
  const xDimension = numericValues[2];
  const yDimension = numericValues[3];

  const movementSequence = [
    { char: 'U', count: yDimension },
    { char: 'R', count: xDimension },
    { char: 'D', count: yDimension },
    { char: 'L', count: xDimension },
    { char: 'L', count: 1 },
    { char: 'U', count: yDimension + 1 },
    { char: 'R', count: xDimension + 1 },
    { char: 'DR', count: 1 },
    { char: 'D', count: yDimension + 1 },
    { char: 'L', count: xDimension + 1 },
    { char: 'U', count: 1 }
  ];

  const finalPath = movementSequence
    .map(segment => segment.char.repeat(segment.count))
    .join('');

  console.log(finalPath);
}

processInputAndGeneratePath(require("fs").readFileSync("/dev/stdin", "utf8"));
