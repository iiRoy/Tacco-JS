var primeFactorCounts;
var currentNumber;
var divisorCandidate;
var factorIndex;

function ProcessInput(rawData) {
  rawData = rawData.split("\n");
  var upperLimit = parseInt(rawData[0]);
  primeFactorCounts = new Array(101).fill(0);

  for (currentNumber = 1; currentNumber <= upperLimit; currentNumber++) {
    var tempNumber = currentNumber;
    for (divisorCandidate = 2; divisorCandidate <= tempNumber; ) {
      if (tempNumber % divisorCandidate === 0) {
        primeFactorCounts[divisorCandidate]++;
        tempNumber = tempNumber / divisorCandidate;
        if (tempNumber === 1) {
          break;
        }
      } else {
        divisorCandidate++;
      }
    }
  }

  var countOfFourOrMoreFactors = 0;
  var countOfTwoOrThreeFactors = 0;

  for (factorIndex = 2; factorIndex < 101; factorIndex++) {
    if (primeFactorCounts[factorIndex] === 2 || primeFactorCounts[factorIndex] === 3) {
      countOfTwoOrThreeFactors++;
    }
    if (primeFactorCounts[factorIndex] >= 4) {
      countOfFourOrMoreFactors++;
    }
  }

  var finalResult = countOfTwoOrThreeFactors * countOfFourOrMoreFactors * (countOfFourOrMoreFactors - 1) / 2 +
                    countOfFourOrMoreFactors * (countOfFourOrMoreFactors - 1) * (countOfFourOrMoreFactors - 2) / 2;

  console.log('%s', finalResult);
}

function runDebugMode() {
  var debugInputString = document.getElementById("input").value;
  ProcessInput(debugInputString);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
