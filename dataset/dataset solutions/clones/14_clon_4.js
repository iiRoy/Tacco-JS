const MIN_SIDE_VALUE = 1;
const MAX_SIDE_VALUE = 1000;

const isSideValueValid = (val) => {
  const numVal = Number(val);
  return !isNaN(numVal) && numVal >= MIN_SIDE_VALUE && numVal <= MAX_SIDE_VALUE;
};

const createShapeAnalyzer = (sideA, sideB, sideC) => {
  const sA = Number(sideA);
  const sB = Number(sideB);
  const sC = Number(sideC);

  if (!isSideValueValid(sA) || !isSideValueValid(sB) || !isSideValueValid(sC)) {
    return null;
  }

  const orderedSides = [sA, sB, sC].sort((x, y) => x - y);

  const checkRightAngled = () => {
    const [shortA, shortB, longC] = orderedSides;
    return (shortA * shortA) + (shortB * shortB) === (longC * longC);
  };

  return {
    isRightAngled: checkRightAngled
  };
};

const processGeometricShapes = (sourceText) => {
  const segmentDelimiter = "\n";
  const valueDelimiter = " ";
  const initialMaxCheck = 1000;

  const rawSegments = sourceText.trim().split(segmentDelimiter);

  let segmentIndex = 0;
  for (const currentSegment of rawSegments) {
    const numericSides = currentSegment.split(valueDelimiter).map(Number);

    if (segmentIndex === 0 && numericSides[0] > initialMaxCheck) {
      break;
    }

    const [a, b, c] = numericSides;
    const shapeInstance = createShapeAnalyzer(a, b, c);

    if (shapeInstance) {
      const rightAngleStatus = shapeInstance.isRightAngled() ? 'YES' : 'NO';
      console.log(rightAngleStatus);
    }
    segmentIndex++;
  }
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
processGeometricShapes(inputData);
