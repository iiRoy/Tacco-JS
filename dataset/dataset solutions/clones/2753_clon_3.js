function processInputData(rawData) {
  let dataSegments = rawData.split("\n")[1].split(" ");

  const parseNumericSegment = (segmentString) => {
    return parseInt(segmentString, 10);
  };

  while (dataSegments.length > 2) {
    const segmentA_str = dataSegments[0];
    const segmentB_str = dataSegments[1];
    const segmentC_str = dataSegments[2];

    let valueA = parseNumericSegment(segmentA_str);
    const valueB = parseNumericSegment(segmentB_str);
    let valueC = parseNumericSegment(segmentC_str);

    const updatedValueA = valueA + valueB;
    const updatedValueC = valueC + valueB;

    dataSegments.shift();
    dataSegments.shift();
    dataSegments.shift();

    dataSegments.unshift(updatedValueC.toString());
    dataSegments.unshift(updatedValueA.toString());
  }

  const finalSegmentOne = parseNumericSegment(dataSegments[0]);
  const finalSegmentTwo = parseNumericSegment(dataSegments[1]);

  const calculatedResult = finalSegmentOne + finalSegmentTwo;

  console.log(calculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
