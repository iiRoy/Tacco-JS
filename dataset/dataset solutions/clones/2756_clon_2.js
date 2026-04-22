function ProcessData(sourceText) {
  sourceText = sourceText.split("\n");
  const ignoredCount = parseInt(sourceText[0]);
  const initialValues = sourceText[1].split(" ").map( item => parseInt(item) );
  let activeSequence = initialValues;

  while (true) {
    let pivotIndex = -1;
    let temporaryList = [];

    for (let k = 1; k < activeSequence.length - 1; k++) {
      if (pivotIndex === -1 || activeSequence[pivotIndex] > activeSequence[k]) {
        pivotIndex = k;
      }
      else if (pivotIndex === activeSequence[k] && activeSequence[k - 1] + activeSequence[k + 1] < activeSequence[pivotIndex - 1] + activeSequence[pivotIndex + 1]) {
        pivotIndex = k;
      }
    }

    if (activeSequence[pivotIndex] * 2 > activeSequence[1]) {
      pivotIndex = 1;
      if (activeSequence[pivotIndex] > activeSequence[activeSequence.length - 2]) {
        pivotIndex = activeSequence.length - 2;
      }
    }
    else if (activeSequence[pivotIndex] * 2 > activeSequence[activeSequence.length - 2]) {
      pivotIndex = activeSequence.length - 2;
    }

    for (let k = 0; k < activeSequence.length; k++) {
      if (k === pivotIndex - 1) {
        temporaryList.push(activeSequence[pivotIndex - 1] + activeSequence[pivotIndex]);
      }
      else if (k === pivotIndex) {
      }
      else if (k === pivotIndex + 1) {
        temporaryList.push(activeSequence[pivotIndex + 1] + activeSequence[pivotIndex]);
      }
      else {
        temporaryList.push(activeSequence[k]);
      }
    }

    activeSequence = temporaryList;
    if (activeSequence.length === 2) break;
  }

  console.log(activeSequence[0] + activeSequence[1]);
}
ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));