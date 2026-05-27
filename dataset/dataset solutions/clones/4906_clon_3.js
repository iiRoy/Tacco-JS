const processInput = (rawData) => {
  const numericValues = rawData.split(" ").map(Number);

  const [firstNum, secondNum, thirdNum] = numericValues;

  const determineEqualityType = () => {
    const allNumbersAreIdentical = (firstNum === secondNum) && (firstNum === thirdNum);
    const atLeastTwoAreIdentical = (firstNum === secondNum) || (firstNum === thirdNum) || (secondNum === thirdNum);

    let classificationResult;

    if (allNumbersAreIdentical) {
      classificationResult = 1;
    } else if (atLeastTwoAreIdentical) {
      classificationResult = 2;
    } else {
      classificationResult = 3;
    }
    return classificationResult;
  };

  console.log(determineEqualityType());
};

processInput(require("fs").readFileSync('/dev/stdin', 'utf-8'));
