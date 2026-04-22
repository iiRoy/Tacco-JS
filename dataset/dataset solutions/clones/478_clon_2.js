const dataSource = require('fs') .readFileSync( '/dev/stdin', 'utf8' ) ;
const linesOfData = dataSource.trim().split( '\n' ) ;

while ( true ) {

  let dimensions = linesOfData.shift().split( ' ' ) ;

  if ( dimensions.join( ' ' ) === '0 0' ) {
    break ;
  }

  const numPlayers = Number( dimensions[0] ) ;
  let numRounds = parseInt( dimensions[1], 10 ) ;

  const playerStatus = [] ;
  for ( let playerIdx = 0 ; playerIdx < numPlayers ; playerIdx++ ) {
    playerStatus[ playerIdx ] = true ;
  }

  let currentNumber = 0 ;
  let currentPlayerIndex = 0 ;
  let expectedOutput = "" ;
  let activePlayersCount = numPlayers ;

  while ( numRounds-- ) {

    if ( activePlayersCount === 1 ) {
      break ;
    }

    currentNumber++ ;

    const playerResponse = linesOfData.shift() ;

    if ( currentNumber % 15 === 0 ) {
      expectedOutput = "FizzBuzz" ;
    } else if ( currentNumber % 3 === 0 ) {
      expectedOutput = "Fizz" ;
    } else if ( currentNumber % 5 === 0 ) {
      expectedOutput = "Buzz" ;
    } else {
      expectedOutput = String( currentNumber ) ;
    }

    if ( playerResponse !== expectedOutput ) {
      playerStatus[ currentPlayerIndex ] = false ;
      activePlayersCount-- ;
    }

    if ( activePlayersCount === 1 ) {
      break ;
    }
    if ( numRounds === 0 ) {
      break ;
    }

    currentPlayerIndex++ ;
    if ( currentPlayerIndex >= numPlayers ) {
      currentPlayerIndex = 0 ;
    }

    while ( playerStatus[ currentPlayerIndex ] === false ) {
      currentPlayerIndex++ ;
      if ( currentPlayerIndex >= numPlayers ) {
        currentPlayerIndex = 0 ;
      }
    }
  }

  const survivors = [] ;
  playerStatus.forEach( ( isActive, participantIndex ) => {
    if ( isActive ) {
      survivors.push( participantIndex + 1 ) ;
    }
  } ) ;

  console.log( survivors.join( ' ' ) ) ;
}