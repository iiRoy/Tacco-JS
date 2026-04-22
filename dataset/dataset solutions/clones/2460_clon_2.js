function obtainData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputVal) {
  console.log(outputVal);
} /* Displays processed information */

/* Conversion parameter description */
/*
 * 0: No operation (returns original value)
 * 1: Converts to an integer number
 * 2: Splits string by a single space character
 * 3: Splits string by a newline character
 * 4: Splits by space and transforms elements to numbers
 * 5: Splits by newline and transforms elements to numbers
 * 6: Splits string into individual character array
 * 7: Splits string into individual characters and converts them to numbers
 */
function processInput(rawItem, mode) {
  switch (mode) {
    case 0:
      return rawItem;
    case 1:
      return parseInt(rawItem);
    case 2:
      return rawItem.split(" ");
    case 3:
      return rawItem.split("\n");
    case 4:
      return rawItem.split(" ").map((element) => Number(element));
    case 5:
      return rawItem.split("\n").map((element) => Number(element));
    case 6:
      return rawItem.split("");
    case 7:
      return rawItem.split("").map((element) => Number(element));
  }
}

function ExecuteLogic(initialData) {
  let valueTracker = new Array(initialData.length + 1);
  initialData = processInput(initialData, 6);

  if (initialData[0] === "<") {
    valueTracker[0] = 0;
  }

  if (initialData[initialData.length - 1] === ">") {
    valueTracker[initialData.length] = 0;
  }

  for (let pos = 1; pos < initialData.length; pos++) {
    const priorChar = initialData[pos - 1];
    const currentSymbol = initialData[pos];

    if (priorChar === ">" && currentSymbol === "<") {
      valueTracker[pos] = 0;
    } else if (priorChar === "<" && currentSymbol === ">") {
      valueTracker[pos] = "x";
    }
  }

  // Debugging: display current state of the value tracker array
  // displayResult(valueTracker);

  let finalAggregate = 0;
  let auxValue = 0; // This variable is declared but not used in the logic.

  for (let idx = 0; idx < valueTracker.length; idx++) {
    if (idx === 0) {
      if (valueTracker[0] == null) {
        valueTracker[0] = 1;
      }
      continue;
    }

    if (valueTracker[idx] === 0) {
      continue;
    }

    if (valueTracker[idx - 1] === 0) {
      valueTracker[idx] = 1;
    } else if (valueTracker[idx] === "x") {
      valueTracker[idx] = valueTracker[idx - 1] + 1;
      if (valueTracker[idx + 1] !== 0) {
        valueTracker[idx + 1] = 1;
      }
      idx++;
      continue;
    } else {
      valueTracker[idx] = valueTracker[idx - 1] + 1;
    }
  }

  for (let idx = 0; idx < valueTracker.length; idx++) {
    finalAggregate += valueTracker[idx];
  }

  // Debugging: display final state of the value tracker array
  // displayResult(valueTracker);
  displayResult(finalAggregate);
}

ExecuteLogic(obtainData());