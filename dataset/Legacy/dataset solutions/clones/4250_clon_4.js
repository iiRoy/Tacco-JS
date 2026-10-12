const processInput = (sourceData) => {
  const contentLines = sourceData.trim().split('\n');
  const firstSequence = contentLines[0];
  const secondSequence = contentLines[1];

  const invertedSecondSequence = secondSequence.split('').reverse().join('');

  if (firstSequence === invertedSecondSequence) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
