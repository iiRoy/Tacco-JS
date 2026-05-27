const parseNumbers = (lineStr) => lineStr.split(/\s/).map(currentVal => Number(currentVal));

const sortDescending = (a, b) => b - a;

function ProcessInputData(rawData) {
  const lines = rawData.trim().split("\n");

  const configParams = parseNumbers(lines[0]);
  const [numX, numY, numZ, topK] = configParams;

  const arrayA = parseNumbers(lines[1]);
  const arrayB = parseNumbers(lines[2]);
  const arrayC = parseNumbers(lines[3]);

  arrayA.sort(sortDescending);
  arrayB.sort(sortDescending);
  arrayC.sort(sortDescending);

  const summedABValues = [];

  for (let idxA = 0; idxA < numX; idxA++) {
    for (let idxB = 0; idxB < numY; idxB++) {
      const currentABSum = arrayA[idxA] + arrayB[idxB];
      summedABValues.push(currentABSum);
    }
  }

  summedABValues.sort(sortDescending);

  const finalSummedValues = [];
  const effectiveABLimit = Math.min(topK, summedABValues.length);

  for (let idxAB = 0; idxAB < effectiveABLimit; idxAB++) {
    for (let idxC = 0; idxC < numZ; idxC++) {
      if (effectiveABLimit < idxAB * idxC) {
        continue;
      }
      const currentABCSum = summedABValues[idxAB] + arrayC[idxC];
      finalSummedValues.push(currentABCSum);
    }
  }

  finalSummedValues.sort(sortDescending);

  for (let outputIdx = 0; outputIdx < topK; outputIdx++) {
    console.log(finalSummedValues[outputIdx]);
  }
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
