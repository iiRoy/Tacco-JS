function SolveProblem(incomingData) {
  let dataRows = incomingData.split("\n");
  const totalItems = parseInt(dataRows[0]);
  dataRows.shift();
  let taskArray = dataRows.map(
    (currentRow) => currentRow.split(" ").map(
      (valueStr) => parseInt(valueStr)
    )
  );
  taskArray.splice(totalItems, taskArray.length - totalItems);
  taskArray.sort(
    (firstItem, secondItem) => {
      if (firstItem[1] < secondItem[1]) {
        return -1;
      }
      if (firstItem[1] > secondItem[1]) {
        return 1;
      }
      return 0;
    }
  );
  let conclusion = "Yes";
  let accumulatedValue = 0;
  for (let idx = 0; idx < totalItems; idx++) {
    accumulatedValue += taskArray[idx][0];
    if (accumulatedValue > taskArray[idx][1]) {
      conclusion = "No";
      break;
    }
  }

  console.log('%s', conclusion);
  return conclusion;
}

function CheckLogic(caseIdentifier) {
  let testInput = document.getElementById("input" + caseIdentifier).value;
  let computedAnswer = SolveProblem(testInput);
  let validationStatus = "WA";
  if (computedAnswer === document.getElementById("output" + caseIdentifier).value.split("\n")[0]) {
    validationStatus = "AC";
  }
  document.getElementById("result" + caseIdentifier).innerHTML = validationStatus;
}
SolveProblem(
  require("fs").readFileSync(
    "/dev/stdin",
    "utf8"
  )
);