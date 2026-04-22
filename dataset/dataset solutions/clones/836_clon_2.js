function exploreAndMark(  currRow,  currCol,  targetType )
{
  const  rowOffsets = [  -1,  0,  0,  1  ];
  const  colOffsets = [  0,  -1,  1,  0  ];

  for ( let  directionIndex = 0;  directionIndex < 4;  directionIndex++ )
  {
    let  nextRow = currRow + rowOffsets[directionIndex];
    let  nextCol = currCol + colOffsets[directionIndex];

    if ( nextRow < 0  ||  nextCol < 0  ||  nextRow >= 12  ||  nextCol >= 6 )
    {
      continue;
    }

    if ( gameBoard[nextRow][nextCol] === targetType )
    {
      clusterSize++;
      if ( clusterSize === 4 )
      {
        removalPoints.push([nextRow, nextCol]);
      }
      gameBoard[nextRow][nextCol] = targetType + clusterSize;
      exploreAndMark(nextRow, nextCol, targetType);
    }
  }
}
function clearConnected ( currentY, currentX, blockDesignation )
{
  const  yAxisOffsets  = [ -1,  0,  0,  1 ];
  const  xAxisOffsets  = [ 0,  -1,  1,  0 ];

  for ( let  iter = 0;  iter < 4;  iter++ )
  {
    let  neighborY = currentY + yAxisOffsets[iter];
    let  neighborX = currentX + xAxisOffsets[iter];

    if ( neighborY < 0  ||  neighborX < 0  ||  neighborY >= 12  ||  neighborX >= 6 )
    {
      continue;
    }

    if ( gameBoard[neighborY][neighborX] === blockDesignation )
    {
      gameBoard[neighborY][neighborX] = "EMPTY";
      clearConnected(neighborY, neighborX, blockDesignation);
    }
    else if ( gameBoard[neighborY][neighborX] === "OBSTACLE" )
    {
      gameBoard[neighborY][neighborX] = "EMPTY";
    }
  }
}
function shiftColumn ( startingRow, colToShift )
{
  let  initialRowPos = startingRow;

  while ( startingRow > 0 )
  {
    startingRow--;
    if ( gameBoard[startingRow][colToShift] !== "EMPTY" )
    {
      gameBoard[initialRowPos][colToShift] = gameBoard[startingRow][colToShift];
      gameBoard[startingRow][colToShift] = "EMPTY";
      break;
    }
  }
}
const  fileSystem = require('fs');
const  rawData = fileSystem.readFileSync('/app/input.txt', 'utf8');

const  lineData = rawData.trim().split("\n");
const  numGames = parseInt(lineData.shift(), 10);

for ( let  gameIdx = 0;  gameIdx < numGames;  gameIdx++ )
{
  let  gameBoard = [];
  for ( let  rowIndex = 0;  rowIndex < 12;  rowIndex++ )
  {
    const  rowString = lineData.shift().split("");
    gameBoard.push(rowString);
  }

  let  chainCount = 0;
  while ( true )
  {
    let  removalPoints = [];
    let  clusterSize;

    for ( let  r = 0;  r < 12;  r++ )
    {
      for ( let  c = 0;  c < 6;  c++ )
      {
        if ( gameBoard[r][c] === "RED" ) { clusterSize = 1; gameBoard[r][c] = "RED" + clusterSize; exploreAndMark(r, c, "RED"); }
        if ( gameBoard[r][c] === "GRN" ) { clusterSize = 1; gameBoard[r][c] = "GRN" + clusterSize; exploreAndMark(r, c, "GRN"); }
        if ( gameBoard[r][c] === "BLU" ) { clusterSize = 1; gameBoard[r][c] = "BLU" + clusterSize; exploreAndMark(r, c, "BLU"); }
        if ( gameBoard[r][c] === "YLW" ) { clusterSize = 1; gameBoard[r][c] = "YLW" + clusterSize; exploreAndMark(r, c, "YLW"); }
        if ( gameBoard[r][c] === "PRP" ) { clusterSize = 1; gameBoard[r][c] = "PRP" + clusterSize; exploreAndMark(r, c, "PRP"); }
      }
    }

    for ( let  r = 0;  r < 12;  r++ )
    {
      for ( let  c = 0;  c < 6;  c++ )
      {
        gameBoard[r][c] = gameBoard[r][c].substring(0, 1);
      }
    }

    if ( removalPoints.length === 0 )
    {
      break;
    }

    chainCount++;
    removalPoints.forEach( function ( coordPair )
    {
      let  rowCoord = coordPair[0];
      let  colCoord = coordPair[1];
      let  blockType = gameBoard[rowCoord][colCoord];
      if ( blockType !== "EMPTY" )
      {
        clearConnected(rowCoord, colCoord, blockType);
      }
    });

    for ( let  r = 11;  r > 0;  r-- )
    {
      for ( let  c = 0;  c < 6;  c++ )
      {
        if ( gameBoard[r][c] === "EMPTY" )
        {
          shiftColumn(r, c);
        }
      }
    }
  }
  console.log(chainCount);
}