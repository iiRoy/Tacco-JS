const processInput = rawInput => {
  const lines = rawInput.trim().split('\n');

  const elementCount = parseInt(lines[0]);
  const initialArr = lines[1].split(' ').map(val => parseInt(val));

  const orderedArr = [...initialArr].sort((a, b) => a - b);

  const mismatchPositions = Array.from({ length: elementCount }, (_, k) => k)
    .filter(idx => initialArr[idx] !== orderedArr[idx]);

  const mismatchCount = mismatchPositions.length;

  let outcome;
  if (mismatchCount === 0) {
    outcome = 'YES';
  } else if (mismatchCount === 2) {
    const [firstMismatchPos, secondMismatchPos] = mismatchPositions;
    if (initialArr[firstMismatchPos] === orderedArr[secondMismatchPos] &&
        initialArr[secondMismatchPos] === orderedArr[firstMismatchPos]) {
      outcome = 'YES';
    } else {
      outcome = 'NO';
    }
  } else {
    outcome = 'NO';
  }

  console.log(outcome);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
