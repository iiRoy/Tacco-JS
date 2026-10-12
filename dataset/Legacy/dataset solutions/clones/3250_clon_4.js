function processData(rawData) {
  const numberCollection = rawData.trim().split(" ").map(Number);

  if (numberCollection.length < 2) {
    console.log(NaN);
    return;
  }

  let firstSmallest = Infinity;
  let secondSmallest = Infinity;

  for (let currentVal of numberCollection) {
    if (currentVal < firstSmallest) {
      secondSmallest = firstSmallest;
      firstSmallest = currentVal;
    } else if (currentVal < secondSmallest) {
      secondSmallest = currentVal;
    }
  }

  console.log((firstSmallest * secondSmallest) / 2);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
