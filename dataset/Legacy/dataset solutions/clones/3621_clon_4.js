const processInput = (rawInputData) => {
  const parsedLines = rawInputData.trim().split('\n');
  const targetValue = parseInt(parsedLines[0]);

  const maxCountA = 25;
  const maxCountB = 14;
  const factorA = 4;
  const factorB = 7;

  const sumCollection = new Set();

  Array.from({ length: maxCountA + 1 }, (_, countA) => {
    Array.from({ length: maxCountB + 1 }, (_, countB) => {
      sumCollection.add(factorA * countA + factorB * countB);
    });
  });

  if (sumCollection.has(targetValue)) {
    console.log('Yes');
  } else {
    console.log('No');
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
