function Main(input) {
  const inputLines = input.split("\n");
  const [gridHeight, gridWidth, totalMoves] = inputLines[0].split(" ").map(Number);
  const [initialRow, initialColumn] = inputLines[1].split(" ").map(Number);
  const sequenceS = inputLines[2].split("");
  const sequenceT = inputLines[3].split("");

  const initialSimulationState = {
    currentMinColumnOffset: 0,
    currentMaxColumnOffset: 0,
    currentMinRowOffset: 0,
    currentMaxRowOffset: 0,
    permissibleMinColumnOffset: 1 - initialColumn,
    permissibleMaxColumnOffset: gridWidth - initialColumn,
    permissibleMinRowOffset: 1 - initialRow,
    permissibleMaxRowOffset: gridHeight - initialRow,
    finalOutcome: "YES"
  };

  const stepProcessor = (currentState, _, moveIndex) => {
    if (currentState.finalOutcome === "NO") {
      return currentState;
    }

    const currentSMove = sequenceS[moveIndex];
    const currentTMove = sequenceT[moveIndex];

    let nextState = { ...currentState };

    // Update character's relative movement range based on S-move
    switch (currentSMove) {
      case "L":
        nextState.currentMinColumnOffset--;
        break;
      case "R":
        nextState.currentMaxColumnOffset++;
        break;
      case "U":
        nextState.currentMinRowOffset--;
        break;
      case "D":
        nextState.currentMaxRowOffset++;
        break;
    }

    // Check if character's current range exceeds permissible boundaries
    if (nextState.currentMaxColumnOffset > nextState.permissibleMaxColumnOffset ||
        nextState.currentMinColumnOffset < nextState.permissibleMinColumnOffset ||
        nextState.currentMaxRowOffset > nextState.permissibleMaxRowOffset ||
        nextState.currentMinRowOffset < nextState.permissibleMinColumnOffset // Replicating original code's typo (sc-u<=0)
        ) {
      return { ...nextState, finalOutcome: "NO" };
    }

    // Adjust permissible boundaries based on T-move
    switch (currentTMove) {
      case "R":
        if (nextState.permissibleMaxColumnOffset < gridWidth - initialColumn) {
          nextState.permissibleMinColumnOffset++;
          nextState.permissibleMaxColumnOffset++;
        }
        break;
      case "L":
        if (nextState.permissibleMinColumnOffset > 1 - initialColumn) {
          nextState.permissibleMinColumnOffset--;
          nextState.permissibleMaxColumnOffset--;
        }
        break;
      case "U":
        if (nextState.permissibleMinRowOffset > 1 - initialRow) {
          nextState.permissibleMinRowOffset--;
          nextState.permissibleMaxRowOffset--;
        }
        break;
      case "D":
        if (nextState.permissibleMaxRowOffset < gridHeight - initialRow) {
          nextState.permissibleMinRowOffset++;
          nextState.permissibleMaxRowOffset++;
        }
        break;
    }

    return nextState;
  };

  const finalState = Array.from({ length: totalMoves }).reduce(stepProcessor, initialSimulationState);

  console.log('%s', finalState.finalOutcome);
  return finalState.finalOutcome;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
