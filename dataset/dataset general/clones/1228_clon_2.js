/**
 * Game AI - for web-based board games
 * Developed for strategic decision-making
 * @ author A.I. Developer
 * @ contact ai.dev@example.com
 * @ project ID 001GAMEAI
 */

var StrategicMind = StrategicMind || {};

StrategicMind.actionLog = {}; // Log of past actions

// Initialize strategic processing
StrategicMind.startProcess = function(initialSequence) {
  var openingBook = StrategicMind.presetPatterns || helper.initialStrategies; // Pre-defined opening moves
  if (openingBook.length) {
    var segmentSize = initialSequence.length;
    var matchingEntries = [];
    // Filter matching sequences
    for (var i = 0; i < openingBook.length; i++) {
      if (openingBook[i].slice(0, segmentSize) == initialSequence) {
        matchingEntries.push(openingBook[i]);
      }
    }
    if (matchingEntries.length) {
      var randomIdx = Math.floor(Math.random() * matchingEntries.length);
      StrategicMind.presetPatterns = matchingEntries;
      return matchingEntries[randomIdx].slice(segmentSize, segmentSize + 4).split("");
    } else {
      StrategicMind.presetPatterns = [];
    }
  }
  // If no preset moves, initiate deep search
  var analysisStart = new Date().getTime();
  StrategicMind.searchDepth = gameInfo.engineDepth;
  //StrategicMind.searchDepth = 4;

  StrategicMind.nodeCount = 0;
  StrategicMind.recordMoveLog.logEntriesCount = 0;

  var bestMoveResult = StrategicMind.evaluateMinimax(-99999, 99999, StrategicMind.searchDepth, helper.deepCopyMatrix(gameInfo.boardState), gameInfo.activePlayer);
  //var bestMoveResult = StrategicMind.deepeningSearch(helper.deepCopyMatrix(gameInfo.boardState), gameInfo.activePlayer)
  if (!bestMoveResult || bestMoveResult.value == -8888) {
    StrategicMind.searchDepth = 2;
    bestMoveResult = StrategicMind.evaluateMinimax(-99999, 99999, StrategicMind.searchDepth, helper.deepCopyMatrix(gameInfo.boardState), gameInfo.activePlayer);
  }
  //var bestMoveResult = StrategicMind.deepeningSearch(helper.deepCopyMatrix(gameInfo.boardState), gameInfo.activePlayer);
  if (bestMoveResult && bestMoveResult.value != -8888) {
    var selectedUnit = gameInfo.units[bestMoveResult.key];
    var analysisEnd = new Date().getTime();
    helper.fetchElement("outputPanel").innerHTML = '<h3>AI Search Results:</h3>Optimal Move: ' +
      helper.generateMoveDescription(helper.deepCopyMatrix(gameInfo.boardState), selectedUnit.x, selectedUnit.y, bestMoveResult.x, bestMoveResult.y) +
      '<br />Search Depth: ' + StrategicMind.searchDepth + '<br />Nodes Explored: ' +
      StrategicMind.nodeCount + ' <br />Optimal Move Evaluation: ' +
      bestMoveResult.value + ' points' +
      ' <br />Search Duration: ' +
      (analysisEnd - analysisStart) + ' milliseconds';
    return [selectedUnit.x, selectedUnit.y, bestMoveResult.x, bestMoveResult.y];
  } else {
    return false;
  }
};

// Perform iterative deepening search
StrategicMind.deepeningSearch = function(boardState, activePlayer) {
  var timeLimit = 100;
  var minSearchDepth = 1;
  var upperDepthLimit = 8;
  StrategicMind.searchDepth = 0;
  var analysisStart = new Date().getTime();
  var bestMoveResult = {};
  for (var i = minSearchDepth; i <= upperDepthLimit; i++) {
    var analysisEnd = new Date().getTime();
    StrategicMind.searchDepth = i;
    StrategicMind.currentIterativeDepth = i;
    var bestMoveResult = StrategicMind.evaluateMinimax(-99999, 99999, StrategicMind.searchDepth, boardState, activePlayer);
    if (analysisEnd - analysisStart > timeLimit) {
      return bestMoveResult;
    }
  }
  return false;
};

// Retrieve all units on the game board
StrategicMind.queryBoardUnits = function(boardState, activePlayer) {
  var playerUnits = [];
  for (var i = 0; i < boardState.length; i++) {
    for (var n = 0; n < boardState[i].length; n++) {
      var key = boardState[i][n];
      if (key && gameInfo.units[key].owner == activePlayer) {
        gameInfo.units[key].x = n;
        gameInfo.units[key].y = i;
        playerUnits.push(gameInfo.units[key]);
      }
    }
  }
  return playerUnits;
};

/*
// Retrieve all possible movements for current player's units (commented out alternative)
StrategicMind.listLegalMoves = function (boardState, activePlayer, boardSnapshotId){
  var priorityMoves = [];   // High priority movements
  var activeUnits = StrategicMind.queryBoardUnits(boardState, activePlayer);
  var generatedMoves = [];
  var cachedRecord = StrategicMind.actionLog[boardSnapshotId];
  for (var i = 0; i < activeUnits.length; i++){
    var pieceInstance = activeUnits[i];
    var possibleDestinations = pieceInstance.calculateLegalMoves(boardState);
    for (var n = 0; n < possibleDestinations.length; n++){
      if (cachedRecord){
        priorityMoves.push([pieceInstance.x, pieceInstance.y, possibleDestinations[n][0], possibleDestinations[n][1], pieceInstance.key]);
      }else{
        generatedMoves.push([pieceInstance.x, pieceInstance.y, possibleDestinations[n][0], possibleDestinations[n][1], pieceInstance.key]);
      }
    }
  }
  return priorityMoves.concat(generatedMoves);
}
*/
// Generate all valid moves for active player's units
StrategicMind.listLegalMoves = function(boardState, activePlayer) {
  var playerUnits = StrategicMind.queryBoardUnits(boardState, activePlayer);
  var generatedMoves = [];
  var illegalLongCheck = gameInfo.isLongChecking;
  for (var i = 0; i < playerUnits.length; i++) {
    var currentUnit = playerUnits[i];
    var currentUnitMoves = currentUnit.calculateLegalMoves(boardState);

    for (var n = 0; n < currentUnitMoves.length; n++) {
      var x = currentUnit.x;
      var y = currentUnit.y;
      var newX = currentUnitMoves[n][0];
      var newY = currentUnitMoves[n][1];
      // Exclude long-check moves
      if (illegalLongCheck[0] != x || illegalLongCheck[1] != y || illegalLongCheck[2] != newX || illegalLongCheck[3] != newY) {
        generatedMoves.push([x, y, newX, newY, currentUnit.key]);
      }
    }
  }
  return generatedMoves;
};
// Parameters: Alpha (min value for maximizing player), Beta (max value for minimizing player), current search depth, board state, active player's side
StrategicMind.evaluateMinimax = function(alpha, beta, currentDepthLevel, boardState, activePlayer) {
  //var boardHash = boardState.join();
  //var cachedEntry = StrategicMind.actionLog[boardHash];
  //	if (cachedEntry && cachedEntry.level >= StrategicMind.searchDepth - currentDepthLevel + 1){
  //		return cachedEntry.score * activePlayer;
  //}
  if (currentDepthLevel == 0) {
    return {
      "value": StrategicMind.calculateHeuristic(boardState, activePlayer)
    }; // Heuristic evaluation function
  }
  var generatedMoves = StrategicMind.listLegalMoves(boardState, activePlayer); // Generate all potential moves
  // Move ordering would enhance performance
  var currentActionKey, currentActionX, currentActionY; // To store last tried move for return in case of no bestInitialMove

  for (var i = 0; i < generatedMoves.length; i++) {


    // Apply the current move
    var currentAction = generatedMoves[i];
    var key = currentAction[4];
    var oldX = currentAction[0];
    var oldY = currentAction[1];
    var newX = currentAction[2];
    var newY = currentAction[3];
    var removedUnitKey = boardState[newY][newX] || "";

    boardState[newY][newX] = key;
    delete boardState[oldY][oldX];
    gameInfo.units[key].x = newX;
    gameInfo.units[key].y = newY;

    if (removedUnitKey == "j0" || removedUnitKey == "J0") { // If the King is captured, this branch is terminal
      gameInfo.units[key].x = oldX;
      gameInfo.units[key].y = oldY;
      boardState[oldY][oldX] = key;
      delete boardState[newY][newX];
      if (removedUnitKey) {
        boardState[newY][newX] = removedUnitKey;
        // gameInfo.units[ removedUnitKey ].isVisible = false;
      }

      return {
        "key": key,
        "x": newX,
        "y": newY,
        "value": 8888
      };
      //return bestInitialMove;
    } else {
      var evaluationScore = -StrategicMind.evaluateMinimax(-beta, -alpha, currentDepthLevel - 1, boardState, -activePlayer).value;
      //evaluationScore = evaluationScore || evaluationScore.value;

      // Revert the current move
      gameInfo.units[key].x = oldX;
      gameInfo.units[key].y = oldY;
      boardState[oldY][oldX] = key;
      delete boardState[newY][newX];
      if (removedUnitKey) {
        boardState[newY][newX] = removedUnitKey;
        //gameInfo.units[ removedUnitKey ].isVisible = true;
      }
      if (evaluationScore >= beta) {
        // Log this move in the action history
        //StrategicMind.recordMoveLog(boardHash,StrategicMind.searchDepth - currentDepthLevel + 1,beta,activePlayer);
        return {
          "key": key,
          "x": newX,
          "y": newY,
          "value": beta
        };
      }
      if (evaluationScore > alpha) {
        alpha = evaluationScore; // Set best move so far
        if (StrategicMind.searchDepth == currentDepthLevel) {
          var bestInitialMove = {
            "key": key,
            "x": newX,
            "y": newY,
            "value": alpha
          };
        }
      }
    }
    currentActionKey = key;
    currentActionX = newX;
    currentActionY = newY;
  }
  // Update the action history with this move
  //StrategicMind.recordMoveLog(boardHash,StrategicMind.searchDepth - currentDepthLevel + 1,alpha,activePlayer);
  if (StrategicMind.searchDepth == currentDepthLevel) { // Reached the root of the search tree
    if (!bestInitialMove) {
      // If no optimal move is found, the AI is likely in a losing position, return false
      return false;
    } else {
      // This represents the optimal initial move
      return bestInitialMove;
    }
  }
  // This return statement is part of the original logic, returning the alpha value with the last tried move's coords if no specific bestInitialMove was set
  return {
    "key": currentActionKey,
    "x": currentActionX,
    "y": currentActionY,
    "value": alpha
  };
};

// Store move details in the historical log
StrategicMind.recordMoveLog = function(boardHash, level, score, player) {
  StrategicMind.recordMoveLog.logEntriesCount++;
  StrategicMind.actionLog[boardHash] = {
    level: level,
    value: score
  };
};

// Assess board state: calculate difference in unit values for both sides
StrategicMind.calculateHeuristic = function(boardState, activePlayer) {
  var heuristicValue = 0;
  for (var i = 0; i < boardState.length; i++) {
    for (var n = 0; n < boardState[i].length; n++) {
      var key = boardState[i][n];
      if (key) {
        heuristicValue += gameInfo.units[key].value[i][n] * gameInfo.units[key].owner;
      }
    }
  }
  //heuristicValue += Math.floor( Math.random() * 10);  // Inject minor randomness for varied AI play (optional)
  //helper.show()
  //debugLog(heuristicValue * activePlayer)
  StrategicMind.nodeCount++;
  return heuristicValue * activePlayer;
};

// Alternative board assessment: sum of unit values
StrategicMind.secondaryEvaluation = function(boardState, activePlayer) {
  var heuristicValue = 0;
  for (var i in gameInfo.units) {
    var currentUnit = gameInfo.units[i];
    if (currentUnit.isVisible) {
      heuristicValue += currentUnit.value[currentUnit.y][currentUnit.x] * currentUnit.owner;
    }
  }
  //heuristicValue += Math.floor( Math.random() * 10);  // Inject minor randomness for varied AI play (optional)
  //helper.show()
  //debugLog(heuristicValue * activePlayer)
  StrategicMind.nodeCount++;
  return heuristicValue * activePlayer;
};