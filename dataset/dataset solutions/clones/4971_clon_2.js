'use strict';
function GameProcessor( inputData )
{
  const gameLines = inputData.split( '\n' );

  const playerQueues = {
    firstPlayer : Array.from( gameLines[0] ),
    secondPlayer: Array.from( gameLines[1] ),
    thirdPlayer : Array.from( gameLines[2] )
  };

  let currentPlayerKey = 'firstPlayer';
  let nextPlayerLabel  = '';
  let gameResult       = '';

  while( true )
  {
    // The original code had a likely typo: `obj[nextTurn]`.
    // It's assumed `nextTurn` was intended to be `thisTime` (now `currentPlayerKey`).
    // This clone reflects the corrected logical flow to be functional.
    nextPlayerLabel = playerQueues[ currentPlayerKey ].shift();

    if( playerQueues[ currentPlayerKey ].length === 0 )
    {
      gameResult = currentPlayerKey.toLocaleUpperCase();
      break;
    }

    currentPlayerKey = nextPlayerLabel;
  }

  console.log( gameResult );
}

GameProcessor( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );