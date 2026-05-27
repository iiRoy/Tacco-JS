function gameSolver(rawInput) {
    const inputLines = rawInput.split("\n");

    const [movesCountStr, targetPileSizeStr] = inputLines[0].split(" ");
    const numAvailableMoves = parseInt(movesCountStr, 10);
    const finalPileSize = parseInt(targetPileSizeStr, 10);

    const stoneRemovalOptions = inputLines[1].split(" ").map(val => parseInt(val, 10));

    const outcomeMemo = new Map();

    const calculateWinner = (currentPile) => {
        if (outcomeMemo.has(currentPile)) {
            return outcomeMemo.get(currentPile);
        }

        if (currentPile === 0) {
            outcomeMemo.set(0, "Second");
            return "Second";
        }

        const canCurrentPlayerWin = stoneRemovalOptions.some(removalAmount => {
            if (currentPile - removalAmount >= 0) {
                return calculateWinner(currentPile - removalAmount) === "Second";
            }
            return false;
        });

        const resultForCurrentPile = canCurrentPlayerWin ? "First" : "Second";
        outcomeMemo.set(currentPile, resultForCurrentPile);
        return resultForCurrentPile;
    };

    const finalGameOutcome = calculateWinner(finalPileSize);

    console.log('%s', finalGameOutcome);
    return finalGameOutcome;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=gameSolver(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}

gameSolver(require("fs").readFileSync("/dev/stdin", "utf8"));
