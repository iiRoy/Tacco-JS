'use strict';
function ProcessGame(rawData) {
  rawData = rawData.split(/\s+/);
  const gridHeight = Number(rawData.shift());
  const gridWidth = Number(rawData.shift());
  const numTurns = Number(rawData.shift());
  const startRow = Number(rawData.shift());
  const startCol = Number(rawData.shift());
  const playerMoves = rawData.shift();
  const enemyMoves = rawData.shift();
  const MOVE_LEFT = 'L';
  const MOVE_RIGHT = 'R';
  const MOVE_UP = 'U';
  const MOVE_DOWN = 'D';
  const MIN_COL_BOUNDARY = 1;
  const MAX_COL_BOUNDARY = gridWidth;
  const MIN_ROW_BOUNDARY = 1;
  const MAX_ROW_BOUNDARY = gridHeight;
  const OUT_OF_BOUNDS_LEFT_COL = 0;
  const OUT_OF_BOUNDS_RIGHT_COL = gridWidth + 1;
  const OUT_OF_BOUNDS_UP_ROW = 0;
  const OUT_OF_BOUNDS_DOWN_ROW = gridHeight + 1;
  const boundaryStates = [[startCol, startCol, startRow, startRow]];
  for (let turnIdx = 0; turnIdx < numTurns; turnIdx++) {
    const currentTurnPlayerMove = playerMoves[turnIdx];
    const currentTurnEnemyMove = enemyMoves[turnIdx];
    const prevMinCol = boundaryStates[turnIdx][0];
    const prevMaxCol = boundaryStates[turnIdx][1];
    const prevMinRow = boundaryStates[turnIdx][2];
    const prevMaxRow = boundaryStates[turnIdx][3];
    let playerAdjustedMinCol = prevMinCol - (currentTurnPlayerMove === MOVE_LEFT ? 1 : 0);
    let playerAdjustedMaxCol = prevMaxCol + (currentTurnPlayerMove === MOVE_RIGHT ? 1 : 0);
    let playerAdjustedMinRow = prevMinRow - (currentTurnPlayerMove === MOVE_UP ? 1 : 0);
    let playerAdjustedMaxRow = prevMaxRow + (currentTurnPlayerMove === MOVE_DOWN ? 1 : 0);
    const isPlayerOutOfBounds =
      playerAdjustedMinCol === OUT_OF_BOUNDS_LEFT_COL ||
      playerAdjustedMaxCol === OUT_OF_BOUNDS_RIGHT_COL ||
      playerAdjustedMinRow === OUT_OF_BOUNDS_UP_ROW ||
      playerAdjustedMaxRow === OUT_OF_BOUNDS_DOWN_ROW;
    if (isPlayerOutOfBounds) {
      console.log('NO');
      return;
    }
    let nextMinCol = playerAdjustedMinCol;
    let nextMaxCol = playerAdjustedMaxCol;
    let nextMinRow = playerAdjustedMinRow;
    let nextMaxRow = playerAdjustedMaxRow;
    nextMinCol = Math.min(nextMinCol + (currentTurnEnemyMove === MOVE_RIGHT ? 1 : 0), MAX_COL_BOUNDARY);
    nextMaxCol = Math.max(nextMinCol - (currentTurnEnemyMove === MOVE_LEFT ? 1 : 0), MIN_COL_BOUNDARY);
    nextMinRow = Math.min(nextMinCol + (currentTurnEnemyMove === MOVE_DOWN ? 1 : 0), MAX_ROW_BOUNDARY);
    nextMaxRow = Math.max(nextMinCol - (currentTurnEnemyMove === MOVE_UP ? 1 : 0), MIN_ROW_BOUNDARY);
    boundaryStates[turnIdx + 1] = [nextMinCol, nextMaxCol, nextMinRow, nextMaxRow];
  }
  console.log('YES');
}
ProcessGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
