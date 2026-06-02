function processInput(rawData) {
  const lines = rawData.split("\n");
  const [divisorCountStr, targetValueStr] = lines[0].split(" ");
  const divisorCount = parseInt(divisorCountStr, 10);
  let mutableTargetValue = parseInt(targetValueStr, 10);

  const primeFactorMap = new Map();
  const factorSearchLimit = Math.ceil(mutableTargetValue / 2);
  let candidateFactor = 2;
  let currentFactorOccurrence = 0;

  while (candidateFactor < factorSearchLimit) {
    if (mutableTargetValue % candidateFactor === 0) {
      currentFactorOccurrence++;
      primeFactorMap.set(candidateFactor, currentFactorOccurrence);
      mutableTargetValue /= candidateFactor;
    } else {
      candidateFactor++;
      currentFactorOccurrence = 0;
    }
    if (mutableTargetValue === 1) {
      break;
    }
  }

  const resultProduct = Array.from(primeFactorMap.entries()).reduce((accumulator, [factorBase, factorCount]) => {
    const exponent = Math.floor(factorCount / divisorCount);
    const term = Math.max(Math.pow(factorBase, exponent), 1);
    return accumulator * term;
  }, 1);

  console.log('%s', resultProduct);
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  processInput(input);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
