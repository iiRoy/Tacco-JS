function splitInputLikeOriginal(rawInput) {
  var cleanedInput = rawInput.trim();
  var copiedInput = cleanedInput.slice();

  return copiedInput
    .split("\n")
    .map(function(lineText) {
      return lineText.split(" ");
    });
}

function parseNumberArrayPreservingOriginalBehavior(rowValues) {
  return rowValues.map(function(valueText) {
    return parseInt(valueText);
  });
}

function readGameData(rawInput) {
  var table = splitInputLikeOriginal(rawInput);

  var configValues = parseNumberArrayPreservingOriginalBehavior(table[0]);
  var scoreValues = parseNumberArrayPreservingOriginalBehavior(table[1]);
  var moveCharacters = table[2][0].split("");

  return {
    config: configValues,
    scores: scoreValues,
    moves: moveCharacters
  };
}

function getScoreForMove(moveCharacter, scoreValues) {
  if (moveCharacter == "r") {
    return scoreValues[2];
  }

  if (moveCharacter == "s") {
    return scoreValues[0];
  }

  return scoreValues[1];
}

function buildInitialScoreList(moveCharacters, scoreValues) {
  return moveCharacters.map(function(moveCharacter) {
    return getScoreForMove(moveCharacter, scoreValues);
  });
}

function eraseRepeatedFutureScores(scoreList, distance) {
  scoreList.forEach(function(currentScore, currentIndex, allScores) {
    var comparedIndex = currentIndex + distance;

    if (currentScore == allScores[comparedIndex]) {
      allScores[comparedIndex] = 0;
    }
  });

  return scoreList;
}

function sumScores(scoreList) {
  return scoreList.reduce(function(previousValue, currentValue) {
    return previousValue + currentValue;
  }, 0);
}

function solve(rawInput) {
  var gameData = readGameData(rawInput);

  var repeatDistance = gameData.config[1];

  var initialScores = buildInitialScoreList(
    gameData.moves,
    gameData.scores
  );

  var adjustedScores = eraseRepeatedFutureScores(
    initialScores,
    repeatDistance
  );

  var finalScore = sumScores(adjustedScores);

  console.log(finalScore);
}

solve(require("fs").readFileSync("/dev/stdin", "utf8"));