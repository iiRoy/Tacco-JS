const obtainData = () => require("fs").readFileSync(0, "utf8").trim();

const displayResult = (val) => console.log(val);

const extractNumericalValue = (txt) => parseInt(txt, 10);

const splitAndConvertNumbers = (txt, divider) => txt.split(divider).map(Number);

const splitByDivider = (txt, divider) => txt.split(divider);

const calculateCount = (sourceText) => {
  const segments = splitByDivider(sourceText, '\n');
  const sizeValue = extractNumericalValue(segments[0]);
  const numericalArray = splitAndConvertNumbers(segments[1], ' ');

  const markerArray = numericalArray.map((value, index) => (value === index + 1 ? 1 : 0));

  let finalTally = 0;
  if (sizeValue > 0) {
    const initialContribution = markerArray[0] === 1 ? 1 : 0;

    const subsequentContributions = markerArray.slice(1).reduce((currentAccumulator, currentElementMarker, slicedIndex) => {
      const precedingElementMarker = markerArray[slicedIndex]; // This corresponds to markerArray[i-1] in original loop
      if (precedingElementMarker === 0 && currentElementMarker === 1) {
        return currentAccumulator + 1;
      }
      return currentAccumulator;
    }, initialContribution);

    finalTally = subsequentContributions;
  }

  return finalTally;
};

const executeProgram = () => {
  const rawInputContent = obtainData();
  const computedOutcome = calculateCount(rawInputContent);
  displayResult(computedOutcome);
};

executeProgram();