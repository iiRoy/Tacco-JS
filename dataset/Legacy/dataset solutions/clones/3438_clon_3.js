function formatNumberSequence(numbersArray) {
  let outputString = "";
  const arrayLength = numbersArray.length;

  for (let i = 0; i < arrayLength; i++) {
    outputString += numbersArray[i];
    if (i < arrayLength - 1) {
      outputString += " ";
    }
  }
  return outputString;
}

const firstLineValue = 4;
const secondLineComponents = [2, 5, 2, 5];

console.log(firstLineValue);
const formattedSecondLine = formatNumberSequence(secondLineComponents);
console.log(formattedSecondLine);
