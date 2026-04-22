'use modernjs';

function ProcessData (  rawData  ) {
  let MaxValue = Math.pow( 2,  50 );
  const ModuloConstant = 998244353;

  rawData = rawData.trim().split( /\s+/g ).map( val => Number(val) );

  let itemCount = rawData.shift();
  let totalSum = rawData.reduce( (acc, current) => acc + current, 0 );
  let targetHalfSum = Math.floor( totalSum / 2 );


  let waysToSumBoth = [];
  // This table stores counts: waysToSumBoth[row][col] is the number of ways to achieve sum 'col'
  // using items from rawData[0] to rawData[row-1], considering two types of items.
  for ( let rowIdx = 0; rowIdx <= itemCount; rowIdx++ ) {
    waysToSumBoth[rowIdx] = [];
    for ( let currentSum = 0; currentSum <= targetHalfSum; currentSum++ ) {
      waysToSumBoth[rowIdx][currentSum] = 0;
    }
  }
  waysToSumBoth[0][0] = 1;

  for ( let rowIdx = 0; rowIdx < itemCount; rowIdx++ ) {
    for ( let currentSum = 0; currentSum <= targetHalfSum; currentSum++ ) {
      waysToSumBoth[rowIdx + 1][currentSum] += waysToSumBoth[rowIdx][currentSum];
      waysToSumBoth[rowIdx + 1][currentSum] %= ModuloConstant;

      if ( currentSum + rawData[rowIdx] <= targetHalfSum ) {
        waysToSumBoth[rowIdx + 1][currentSum + rawData[rowIdx]] += ( 2 * waysToSumBoth[rowIdx][currentSum] );
        waysToSumBoth[rowIdx + 1][currentSum + rawData[rowIdx]] %= ModuloConstant;
      }
    }
  }


  let finalResult = 1;
  for ( let loopCounter = 0; loopCounter < itemCount; loopCounter++ ) {
    finalResult *= 3;
    finalResult %= ModuloConstant;
  }

  waysToSumBoth[itemCount].forEach( function ( countVal, idx, fullArray ) {
    finalResult -= ( 3 * countVal );
  });


  let waysToSumOneType = [];
  // This table stores counts: waysToSumOneType[r][c] is the number of ways to achieve sum 'c'
  // using items from rawData[0] to rawData[r-1], considering only one type of item.
  for ( let r = 0; r <= itemCount; r++ ) {
    waysToSumOneType[r] = [];
    for ( let c = 0; c <= targetHalfSum; c++ ) {
      waysToSumOneType[r][c] = 0;
    }
  }
  waysToSumOneType[0][0] = 1;

  for ( let r = 0; r < itemCount; r++ ) {
    for ( let c = 0; c <= targetHalfSum; c++ ) {
      waysToSumOneType[r + 1][c] += waysToSumOneType[r][c];
      waysToSumOneType[r + 1][c] %= ModuloConstant;

      if ( c + rawData[r] <= targetHalfSum ) {
        waysToSumOneType[r + 1][c + rawData[r]] += waysToSumOneType[r][c];
        waysToSumOneType[r + 1][c + rawData[r]] %= ModuloConstant;
      }
    }
  }


  if ( totalSum % 2 === 0 ) {
    finalResult += ( 3 * waysToSumOneType[itemCount][targetHalfSum] );
    finalResult %= ModuloConstant;
  }

  finalResult += ModuloConstant;
  finalResult %= ModuloConstant;
  
  console.log( finalResult );
}

ProcessData( require('node:fs').readFileSync( '/dev/stdin', 'utf-8' ) );