function ProcessInput(rawData) {
  const lineData = rawData.split("\n");

  const RADIX_DECIMAL = 10;

  let queryCount;
  queryCount = parseInt(lineData[0], RADIX_DECIMAL);

  let totalA = 0;
  let totalB = 0;
  const dataPointsA = [];

  const findClosestToAverage = (arr, avg) => {
    if (arr.length === 0) {
      return undefined;
    }

    let minSquaredDistance = Math.pow(arr[0] - avg, 2);
    let closestValA = arr[0];

    for (let dataIndex = 0; dataIndex < arr.length; dataIndex++) {
      const currentSquaredDistance = Math.pow(arr[dataIndex] - avg, 2);

      if (currentSquaredDistance < minSquaredDistance) {
        minSquaredDistance = currentSquaredDistance;
        closestValA = arr[dataIndex];
      } else if (currentSquaredDistance === minSquaredDistance) {
        closestValA = arr[dataIndex] < closestValA ? arr[dataIndex] : closestValA;
      }
    }
    return closestValA;
  };

  const calculateAbsoluteDifferenceSum = (arr, referenceValue) => {
    let sumOfDifferences = 0;
    for (let dataIndex = 0; dataIndex < arr.length; dataIndex++) {
      sumOfDifferences += Math.abs(arr[dataIndex] - referenceValue);
    }
    return sumOfDifferences;
  };


  for (let queryIndex = 1; queryIndex <= queryCount; queryIndex++) {
    const currentQueryParts = lineData[queryIndex].split(" ");

    const queryType = parseInt(currentQueryParts[0], RADIX_DECIMAL);

    if (queryType === 1) {
      const valA = parseInt(currentQueryParts[1], RADIX_DECIMAL);
      const valB = parseInt(currentQueryParts[2], RADIX_DECIMAL);

      totalA += valA;
      totalB += valB;
      dataPointsA.push(valA);
    } else {
      const currentLengthA = dataPointsA.length;
      const averageA = totalA / currentLengthA;

      const closestValA = findClosestToAverage(dataPointsA, averageA);
      const calculatedValue = calculateAbsoluteDifferenceSum(dataPointsA, closestValA);

      console.log('%d %d', closestValA, calculatedValue);
    }
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
