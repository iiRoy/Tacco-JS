function processData(rawInputString) {
  "use strict";
  const inputLines = rawInputString.split('\n');

  const initialLineContent = inputLines.shift();
  const dataElements = initialLineContent.split(); // Preserves original behavior: split() with no args on "abc" yields ["abc"]

  const numQueries = parseInt(inputLines.shift(), 10);
  const commandList = inputLines.map(cmdStr => cmdStr.split(' '));

  let currentReverseState = 0; // 0 for normal, 1 for reversed

  const TYPE_ONE_COMMAND_LENGTH = 1;
  const PUSH_DIRECTION_INDICATOR = 0; // Corresponds to (currentReverseState + typeParity) % 2 == 0

  for (const currentCommand of commandList) {
    if (currentCommand.length === TYPE_ONE_COMMAND_LENGTH) {
      // Toggle the reverse state
      currentReverseState = 1 - currentReverseState;
    } else {
      const typeValue = parseInt(currentCommand[1], 10);
      const typeParity = typeValue % 2; // 0 for even, 1 for odd

      // Determine effective direction based on current reverse state and query type
      // If (currentReverseState + typeParity) is even, push. Otherwise, unshift.
      const effectiveDirection = (currentReverseState + typeParity) % 2;
      const elementToAdd = currentCommand[2];

      if (effectiveDirection === PUSH_DIRECTION_INDICATOR) {
        dataElements.push(elementToAdd);
      } else {
        dataElements.unshift(elementToAdd);
      }
    }
  }

  // Prepare the final output string
  const finalOutput = currentReverseState ? dataElements.reverse().join('') : dataElements.join('');
  console.log(finalOutput);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
