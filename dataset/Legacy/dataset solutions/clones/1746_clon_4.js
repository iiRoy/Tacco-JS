function Main(inputData) {
  const inputParts = inputData.split("\n");
  const firstSegment = inputParts[0];

  const numericalValue = parseInt(firstSegment, 10);

  const alphabetArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  function generateBase26String(currentNumber) {
    if (currentNumber === 0) {
      return '';
    }
    const charIndex = (currentNumber - 1) % 26;
    const nextIterationNumber = Math.floor((currentNumber - 1) / 26);
    return generateBase26String(nextIterationNumber) + alphabetArray[charIndex];
  }

  const finalResultString = generateBase26String(numericalValue);

  console.log(finalResultString);
}

Main("123456789");
