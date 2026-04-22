const processInputData = (inputString) => {
  const numericValue = Number.parseInt(inputString);

  let outputCollection = [3, 5];
  let runningSum = 0;

  const calculateMidSection = (indexVal, endLimit, collectionRef) => {
    if (indexVal >= endLimit) {
      return 0;
    }
    const currentElementValue = indexVal * 2;
    collectionRef[indexVal] = currentElementValue;
    return currentElementValue + calculateMidSection(indexVal + 1, endLimit, collectionRef);
  };

  runningSum = calculateMidSection(2, numericValue - 1, outputCollection);

  const remainderAfterModulo = runningSum % 30;
  const finalElementComputed = (remainderAfterModulo === 0)
    ? (runningSum + 22)
    : (runningSum + 30 - (2 * remainderAfterModulo) + 22);

  outputCollection[numericValue - 1] = finalElementComputed;

  return outputCollection.join(" ");
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));