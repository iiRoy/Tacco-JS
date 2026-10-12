const parseInteger = (textValue) => Number.parseInt(textValue, 10);

const findGCD = (firstNum, secondNum) => {
  const absoluteFirst = Math.abs(firstNum);
  const absoluteSecond = Math.abs(secondNum);
  return absoluteSecond === 0 ? absoluteFirst : findGCD(absoluteSecond, absoluteFirst % absoluteSecond);
};

const findLCM = (valOne, valTwo) => {
  if (valOne === 0 || valTwo === 0) {
    return 0;
  }
  return Math.abs((valOne * valTwo) / findGCD(valOne, valTwo));
};

const solveProblem = (inputContent) => {
  const inputLines = inputContent.split("\n");
  const [lengthA, lengthB] = inputLines[0].split(' ').map(parseInteger);
  const stringA = inputLines[1];
  const stringB = inputLines[2];

  const commonMultipleInterval = findLCM(lengthA, lengthB);

  if (stringA[0] !== stringB[0]) {
    console.log(-1);
    return;
  }

  const finalLength = Array.from(
    { length: (lengthA * lengthB / commonMultipleInterval) },
    (_, index) => (index + 1) * commonMultipleInterval
  ).find(currentCandidateLength => {
    const characterRegistry = new Map();

    Array.from({ length: lengthA - 1 }, (_, k) => k + 1)
      .forEach(charIndex => {
        characterRegistry.set(charIndex * currentCandidateLength / lengthA, stringA[charIndex]);
      });

    const noMismatchDetected = Array.from({ length: lengthB - 1 }, (_, k) => k + 1)
      .every(charIndex => {
        const positionInCombined = charIndex * currentCandidateLength / lengthB;
        const charFromB = stringB[charIndex];

        if (characterRegistry.has(positionInCombined)) {
          return charFromB === characterRegistry.get(positionInCombined);
        } else {
          characterRegistry.set(positionInCombined, charFromB);
          return true;
        }
      });

    return noMismatchDetected;
  });

  console.log(finalLength !== undefined ? finalLength : -1);
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
