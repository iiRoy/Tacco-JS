function Main(input) {
  const rawInputLines = input.split("\n");

  const parameterLine = rawInputLines[0].split(" ");
  const countA = parseInt(parameterLine[0], 10);
  const countB = parseInt(parameterLine[1], 10);

  const powerValues = rawInputLines[1].split(" ").map(str => parseInt(str, 10));

  const scoreDetails = Array.from({ length: countA }, (_, outerIdx) =>
    Array.from({ length: outerIdx + 1 }, (_, innerIdx) => ({
      val: powerValues[outerIdx] + powerValues[innerIdx],
      isDiag: (outerIdx === innerIdx)
    }))
  ).flat();

  let accumulatedSum = 0;
  let itemsSelected = 0;
  const consumedIndices = new Set();

  while (itemsSelected < countB) {
    let highestValueFound = -Infinity;
    let highestValuePosition = -1;

    for (let itemIdx = 0; itemIdx < scoreDetails.length; itemIdx++) {
      if (!consumedIndices.has(itemIdx)) {
        if (scoreDetails[itemIdx].val > highestValueFound) {
          highestValueFound = scoreDetails[itemIdx].val;
          highestValuePosition = itemIdx;
        }
      }
    }

    const currentItem = scoreDetails[highestValuePosition];

    if (currentItem.isDiag || (itemsSelected + 1 === countB)) {
      accumulatedSum += currentItem.val;
      itemsSelected++;
    } else {
      accumulatedSum += 2 * currentItem.val;
      itemsSelected += 2;
    }

    consumedIndices.add(highestValuePosition);
  }

  console.log(accumulatedSum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
