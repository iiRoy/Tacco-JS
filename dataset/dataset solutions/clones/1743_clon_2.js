process.stdin.resume();
process.stdin.setEncoding(
  "utf8"
);
process.stdin.on("data", (rawData) => {
  const parsedDetails = parseDataStream(rawData);
  const finalValue = calculateOutcome(parsedDetails.TargetCount, parsedDetails.ValueList);

  console.log(finalValue);
});

const parseDataStream = (streamContent) => {
  const inputSegments = streamContent.split("\n");
  const firstSegment = inputSegments[0].split(" ");
  const secondSegment = inputSegments[1].split(" ");

  const TotalItems = firstSegment[0];
  const TargetCount = firstSegment[1];

  const parsedValues = secondSegment.map((strVal) =>
    Number(strVal)
  );

  return {
    TotalItems: TotalItems,
    TargetCount: TargetCount,
    ValueList: parsedValues,
  };
};

const calculateOutcome = (itemCount, numericalArray) => {
  numericalArray.sort((itemA, itemB) => {
    if (itemA > itemB)
      return 1;
    if (itemA < itemB)
      return -1;
    return 0;
  });

  const totalSum = numericalArray.slice(0, itemCount).reduce(
    (accumulated, currentVal) => {
      return accumulated + currentVal;
    },
    0
  );

  return totalSum;
};