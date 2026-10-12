function calculateSquaredEuclideanDistance(pointOne, pointTwo) {
  const deltaX = pointOne[0] - pointTwo[0];
  const deltaY = pointOne[1] - pointTwo[1];
  return deltaX * deltaX + deltaY * deltaY;
}

function determineCircumcircle(pA, pB, pC) {
  let circleCenterX, circleCenterY, circleSquaredRadius;

  const sqDistAB = calculateSquaredEuclideanDistance(pA, pB);
  const sqDistAC = calculateSquaredEuclideanDistance(pA, pC);
  const sqDistBC = calculateSquaredEuclideanDistance(pC, pB);

  const sideLengths = [];
  sideLengths.push([sqDistAB, 0]);
  sideLengths.push([sqDistAC, 1]);
  sideLengths.push([sqDistBC, 2]);

  sideLengths.sort((s1, s2) => s2[0] - s1[0]);

  if (sideLengths[0][0] > sideLengths[1][0] + sideLengths[2][0]) {
    let diameterPoint1, diameterPoint2;
    const longestSideIdentifier = sideLengths[0][1];

    if (longestSideIdentifier === 0) {
      diameterPoint1 = pA;
      diameterPoint2 = pB;
    } else if (longestSideIdentifier === 1) {
      diameterPoint1 = pA;
      diameterPoint2 = pC;
    } else {
      diameterPoint1 = pB;
      diameterPoint2 = pC;
    }

    circleCenterX = (diameterPoint1[0] + diameterPoint2[0]) / 2;
    circleCenterY = (diameterPoint1[1] + diameterPoint2[1]) / 2;
    circleSquaredRadius = calculateSquaredEuclideanDistance(diameterPoint1, [circleCenterX, circleCenterY]);
  } else {
    const pAx = pA[0], pAy = pA[1];
    const pBx = pB[0], pBy = pB[1];
    const pCx = pC[0], pCy = pC[1];

    const sqPA = pAx * pAx + pAy * pAy;
    const sqPB = pBx * pBx + pBy * pBy;
    const sqPC = pCx * pCx + pCy * pCy;

    const numYTerm1Factor = pCx - pAx;
    const numYTerm1Value = sqPA - sqPB;
    const numYTerm2Factor = pBx - pAx;
    const numYTerm2Value = sqPA - sqPC;

    const denomYTerm1Factor = pCx - pAx;
    const denomYTerm1Value = pAy - pBy;
    const denomYTerm2Factor = pBx - pAx;
    const denomYTerm2Value = pAy - pCy;

    const denominatorY = 2 * (denomYTerm1Factor * denomYTerm1Value - denomYTerm2Factor * denomYTerm2Value);

    circleCenterY = (numYTerm1Factor * numYTerm1Value - numYTerm2Factor * numYTerm2Value) / denominatorY;

    if (pAx !== pBx) {
      const cxNumPart1 = (2 * pAy - pBy) * circleCenterY;
      const cxNumPart2 = sqPA;
      const cxNumPart3 = sqPB;
      circleCenterX = (cxNumPart1 - cxNumPart2 + cxNumPart3) / (2 * (pBx - pAx));
    } else {
      const cxNumPart1 = (2 * pAy - pCy) * circleCenterY;
      const cxNumPart2 = sqPA;
      const cxNumPart3 = sqPC;
      circleCenterX = (cxNumPart1 - cxNumPart2 + cxNumPart3) / (2 * (pCx - pAx));
    }

    circleSquaredRadius = calculateSquaredEuclideanDistance(pA, [circleCenterX, circleCenterY]);
  }
  return [circleCenterX, circleCenterY, circleSquaredRadius];
}

function findSmallestEnclosingCircleRadius(allPoints, numPoints) {
  let minimumRadius = 0;

  for (let idxA = 0; idxA < numPoints; idxA++) {
    for (let idxB = idxA + 1; idxB < numPoints; idxB++) {
      for (let idxC = idxB + 1; idxC < numPoints; idxC++) {
        const point1 = allPoints[idxA];
        const point2 = allPoints[idxB];
        const point3 = allPoints[idxC];

        const [circleCenterX, circleCenterY, circleSquaredRadius] = determineCircumcircle(point1, point2, point3);

        let allPointsCovered = true;
        for (let idxP = 0; idxP < numPoints; idxP++) {
          const currentPoint = allPoints[idxP];
          const distToCenterSq = calculateSquaredEuclideanDistance(currentPoint, [circleCenterX, circleCenterY]);
          if (distToCenterSq > circleSquaredRadius) {
            allPointsCovered = false;
            break;
          }
        }

        if (allPointsCovered) {
          minimumRadius = Math.sqrt(circleSquaredRadius);
          return minimumRadius;
        }
      }
    }
  }
  return minimumRadius;
}

function ProcessInput(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const pointCount = parseInt(inputLines[0]);

  const coordinateDataStrings = inputLines.slice(1, pointCount + 1);
  const coordinates = coordinateDataStrings.map(line => line.split(" ").map(coordStr => parseInt(coordStr)));

  const resultRadius = findSmallestEnclosingCircleRadius(coordinates, pointCount);

  console.log('%s', resultRadius);
  return resultRadius;
}

function testSolution(testNumber) {
  const testInput = document.getElementById("input" + testNumber).value;
  const actualResult = ProcessInput(testInput);
  let evaluationStatus = "WA";
  if (actualResult == document.getElementById("output" + testNumber).value.split("\n")[0]) {
    evaluationStatus = "AC";
  }
  document.getElementById("result" + testNumber).innerHTML = evaluationStatus;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
