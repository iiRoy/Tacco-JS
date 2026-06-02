const WIN_STATE_STR = "First";
const LOSE_STATE_STR = "Second";

function parseGameParameters(inputLine) {
    const parts = inputLine.split(" ");
    return {
        totalMoveTypes: parseInt(parts[0]),
        targetPileAmount: parseInt(parts[1])
    };
}

function checkWinningMoveExists(currentPileSize, possibleMoves, outcomeMemo) {
    for (let moveOptionIndex = 0; moveOptionIndex < possibleMoves.length; moveOptionIndex++) {
        const moveValue = possibleMoves[moveOptionIndex];
        const remainingPileAfterMove = currentPileSize - moveValue;

        if (remainingPileAfterMove >= 0) {
            if (outcomeMemo[remainingPileAfterMove] === LOSE_STATE_STR) {
                return true;
            }
        }
    }
    return false;
}

function processGameLogic(rawInputData) {
    const inputLines = rawInputData.split("\n");
    const { totalMoveTypes, targetPileAmount } = parseGameParameters(inputLines[0]);
    const availableMoveValues = inputLines[1].split(" ").map(str => parseInt(str));

    const gameOutcomeMemo = new Array(targetPileAmount + 1);

    const initialMoveBoundary = availableMoveValues[0]; // Based on original code's a[0] usage

    for (let pileSize = 0; pileSize < initialMoveBoundary; pileSize++) {
        gameOutcomeMemo[pileSize] = LOSE_STATE_STR;
    }

    for (let currentPile = initialMoveBoundary; currentPile <= targetPileAmount; currentPile++) {
        if (checkWinningMoveExists(currentPile, availableMoveValues, gameOutcomeMemo)) {
            gameOutcomeMemo[currentPile] = WIN_STATE_STR;
        } else {
            gameOutcomeMemo[currentPile] = LOSE_STATE_STR;
        }
    }

    const finalGameOutcome = gameOutcomeMemo[targetPileAmount];

    console.log('%s', finalGameOutcome);
    return finalGameOutcome;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=processGameLogic(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}

processGameLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
