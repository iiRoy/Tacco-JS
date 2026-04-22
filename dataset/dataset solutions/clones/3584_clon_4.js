const analyzeInputSegment = (segmentSource) => {
  let extractedToken = '';
  for (let position = 0; position < segmentSource.length; ++position) {
    if (segmentSource[position] === ' ') {
      break;
    }
    extractedToken += segmentSource[position];
  }

  const testForNumericEquivalence = (candidate) => {
    if (candidate === '') {
      return true;
    }
    return !Object.is(+candidate, NaN);
  };

  return testForNumericEquivalence(extractedToken) ? 1 : NaN;
};

const acquireExternalData = (filepath) => {
  return require("fs").readFileSync(filepath, "utf8");
};

const displayOutput = (dataPoint) => {
  console.log(dataPoint);
};

displayOutput(analyzeInputSegment(acquireExternalData("/dev/stdin")));