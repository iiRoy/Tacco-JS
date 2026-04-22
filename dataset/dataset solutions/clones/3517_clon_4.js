const craftInputAccessor = (rawText) => {
  let contentRows = rawText.split("\n");
  let currentRowIndex = 0;

  const extractSegment = (asStringFlag) => {
    if (!contentRows[currentRowIndex]) {
      return undefined;
    }
    
    if (!contentRows[currentRowIndex]._tokens) {
      contentRows[currentRowIndex]._tokens = contentRows[currentRowIndex].split(" ");
    }
    
    const segment = contentRows[currentRowIndex]._tokens.shift();
    if (contentRows[currentRowIndex]._tokens.length === 0) {
      currentRowIndex++;
    }
    return asStringFlag ? segment : Number(segment);
  };

  const obtainLineTokens = (asStringFlag) => {
    const line = contentRows[currentRowIndex++];
    const tokens = line.split(" ");
    return asStringFlag ? tokens : tokens.map(token => Number(token));
  };

  const gatherLineBlocks = (count, asStringFlag) => {
    const blocks = Array.from({ length: count }, () => 
      obtainLineTokens(asStringFlag)
    );
    return blocks;
  };

  return {
    fetchValue: extractSegment,
    readLine: obtainLineTokens,
    collectMatrix: gatherLineBlocks,
  };
};

const inputSource = craftInputAccessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processCoordinates());

function processCoordinates() {
  const coordinateCount = inputSource.fetchValue();
  const pointData = inputSource.collectMatrix(coordinateCount);

  const initialSumParity = (pointData[0][0] + pointData[0][1]) % 2;
  
  const allParitiesMatch = pointData.slice(1).every(pair => {
    const currentSumParity = (pair[0] + pair[1]) % 2;
    return currentSumParity === initialSumParity;
  });

  if (!allParitiesMatch) {
    return -1;
  }

  const pathStepCount = initialSumParity === 0 ? 32 : 31;
  const magnitudeSequence = Array.from({ length: pathStepCount }, (_, index) => {
    if (initialSumParity === 0) {
      return index === 31 ? 1 : Math.pow(2, 30 - index);
    } else {
      return Math.pow(2, 30 - index);
    }
  });

  const movementTrails = pointData.map(currentPoint => {
    let [currentX, currentY] = currentPoint;
    let pathString = "";

    magnitudeSequence.forEach(weightVal => {
      const absoluteX = Math.abs(currentX);
      const absoluteY = Math.abs(currentY);

      if (absoluteX > absoluteY) {
        if (currentX > 0) {
          currentX -= weightVal;
          pathString += "R";
        } else {
          currentX += weightVal;
          pathString += "L";
        }
      } else {
        if (currentY > 0) {
          currentY -= weightVal;
          pathString += "U";
        } else {
          currentY += weightVal;
          pathString += "D";
        }
      }
    });
    return pathString;
  });

  return `${pathStepCount}\n${magnitudeSequence.join(" ")}\n${movementTrails.join("\n")}`;
}