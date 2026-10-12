function processInputData(rawData) {
  const DECIMAL_RADIX = 10;

  let lineSegments = rawData.split("\n");

  let currentXCoordinate = 0;
  let currentYCoordinate = 0;
  let travelResult = "Yes";

  let lastVisitedTime = 0;

  const getAbsoluteDifference = (valA, valB) => Math.abs(valB - valA);

  const parseIntegerWithRadix = (str) => parseInt(str, DECIMAL_RADIX);

  for (let segmentIndex = 1; segmentIndex < lineSegments.length; segmentIndex++) {
    const currentSegmentData = lineSegments[segmentIndex].split(" ");

    if (currentSegmentData.length < 3) {
        continue;
    }

    const totalTimeAtTarget = parseIntegerWithRadix(currentSegmentData[0]);
    const targetXCoordinate = parseIntegerWithRadix(currentSegmentData[1]);
    const targetYCoordinate = parseIntegerWithRadix(currentSegmentData[2]);

    let durationForSegment = totalTimeAtTarget - lastVisitedTime;

    const xDistanceNeeded = getAbsoluteDifference(currentXCoordinate, targetXCoordinate);
    const yDistanceNeeded = getAbsoluteDifference(currentYCoordinate, targetYCoordinate);
    const totalDistanceRequired = xDistanceNeeded + yDistanceNeeded;

    if (totalDistanceRequired < durationForSegment) {
      const excessTime = durationForSegment - totalDistanceRequired;
      if (excessTime % 2 !== 0) {
        travelResult = "No";
      }
    } else if (totalDistanceRequired > durationForSegment) {
      travelResult = "Yes";
    }

    currentXCoordinate = targetXCoordinate;
    currentYCoordinate = targetYCoordinate;
    lastVisitedTime = durationForSegment;
  }

  console.log(travelResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
