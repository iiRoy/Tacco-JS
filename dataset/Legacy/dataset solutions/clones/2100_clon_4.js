function Main(input) {
  const [valN, valA, valB] = input.split(" ").map(Number);

  if (valA + valB === 0) {
    console.log(0);
    return;
  }

  const cycleLength = valA + valB;
  const completeCycleCount = Math.floor(valN / cycleLength);
  const redFromCompleteCycles = completeCycleCount * valA;
  const remainingItems = valN % cycleLength;
  const redFromRemaining = Math.min(valA, remainingItems);

  const totalRedCount = redFromCompleteCycles + redFromRemaining;
  console.log(totalRedCount);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
