const processInputAndSolve = (rawData) => {
  const lines = rawData.split("\n");

  const [countItems, maxOperations] = lines[0].split(" ").map(Number);
  const itemCosts = lines[1].split(" ").map(Number);
  const itemFactors = lines[2].split(" ").map(Number);

  itemCosts.sort((valA, valB) => valB - valA);

  itemFactors.sort((valA, valB) => valA - valB);

  let searchUpper = 1000000;
  let searchLower = 0;

  while (searchLower + 1 < searchUpper) {
    const currentMid = (searchLower + searchUpper) / 2;

    const totalRequired = itemCosts.reduce((accumulator, currentCost, index) => {
      const factorValue = itemFactors[index];
      return accumulator + Math.max(0, currentCost - currentMid / factorValue);
    }, 0);

    if (totalRequired <= maxOperations) {
      searchUpper = currentMid;
    } else {
      searchLower = currentMid;
    }
  }

  console.log("d:%s t:%s", searchLower, searchUpper);
};

processInputAndSolve(
  require("fs").readFileSync("/dev/stdin", "utf8")
);
