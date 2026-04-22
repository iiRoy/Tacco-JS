function processNumericalData(inputStringContent) {
  const lineDetails = inputStringContent.split('\n').filter(Boolean);

  const initialValues = lineDetails[0].match(/\d+/g).map(Number);
  const necessaryLimit = initialValues[0];
  // The second value (N) from the first line is extracted but not utilized in the original logic,
  // so it's also not utilized here, maintaining functional equivalence.
  // const dataSize = initialValues[1]; 

  const numericalSequence = lineDetails[1].match(/\d+/g).map(Number);

  const sumElementsRecursively = (elements) => {
    if (elements.length === 0) {
      return 0;
    }
    const [first, ...rest] = elements;
    return first + sumElementsRecursively(rest);
  };

  const accumulatedValue = sumElementsRecursively(numericalSequence);

  if (accumulatedValue >= necessaryLimit) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

processNumericalData(require("fs").readFileSync("/dev/stdin", "utf8"));