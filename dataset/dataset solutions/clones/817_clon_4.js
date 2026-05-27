process.stdin.resume();
process.stdin.setEncoding('utf8');

const getPowerOfTen = (exponent) => Math.pow(10, Math.floor(exponent));

const generateNumberRange = (startValue, endValue) =>
  Array.from({ length: endValue - startValue }, (_, index) => startValue + index);

process.stdin.on('data', (inputContent) => {
  const inputLines = inputContent.trim().split('\n');
  const totalTestCases = Number(inputLines[0]);

  const testCaseSpecifications = inputLines
    .slice(1, totalTestCases + 1)
    .map((line) => line.split(' ').map(Number));

  testCaseSpecifications.forEach((currentSpec) => {
    const [digitsForA, digitsForB] = currentSpec;

    const lowerBoundA = getPowerOfTen(digitsForA - 1);
    const upperBoundA = getPowerOfTen(digitsForA);
    const lowerBoundB = getPowerOfTen(digitsForB - 1);
    const upperBoundB = getPowerOfTen(digitsForB);

    const possibleValuesA = generateNumberRange(lowerBoundA, upperBoundA);
    const possibleValuesB = generateNumberRange(lowerBoundB, upperBoundB);

    const matchingPairs = possibleValuesA.flatMap((valueA) =>
      possibleValuesB
        .filter((valueB) => {
          const arithmeticSum = (valueA + valueB) * (valueB - valueA + 1) / 2;
          const concatenatedNumber = Number(`${valueA}${valueB}`);
          return arithmeticSum === concatenatedNumber;
        })
        .map((valueB) => `${valueA} ${valueB}`)
    );

    if (matchingPairs.length > 0) {
      matchingPairs.forEach((pairString) => console.log(pairString));
    } else {
      console.log('No cats.');
    }
  });
});
