console.log( ( function ( rawInput ) {
  const lineArray = rawInput.trim() . split ( '\n' ) ;
  const numItems = lineArray.shift() | 0x0 ;
  const itemRecords = [ ] ;
  let totalBalance = 0x0 , startsWithParen = 0 , endsWithParen = 0 ;
  for ( let itemIdx = 0 ; itemIdx < numItems ; itemIdx++ ) {
    itemRecords[itemIdx] = { firstChar : lineArray[itemIdx][0] , lastChar : lineArray[itemIdx][lineArray[itemIdx].length-1] , currentBalance : 0 } ;
    for ( let charPos = 0 , lenOfLine = lineArray[itemIdx].length ; charPos < lenOfLine ; charPos++ ) {
      if ( lineArray[itemIdx][charPos] === '(' ) {
        itemRecords[itemIdx].currentBalance++;
      } else if ( lineArray[itemIdx][charPos] === ')' ) {
        itemRecords[itemIdx].currentBalance--;
      }
    }
    totalBalance += itemRecords[itemIdx].currentBalance ;
    if ( itemRecords[itemIdx].firstChar === '(' ) startsWithParen++ ;
    if ( itemRecords[itemIdx].lastChar === ')' ) endsWithParen++ ;
  }
  if ( totalBalance !== 0 || !startsWithParen || !endsWithParen ) {
    return 'No' ;
  }
  if ( numItems === 1 ) {
    return 'Yes' ;
  }
  itemRecords.sort( ( recA , recB ) => recB.currentBalance - recA.currentBalance ) ;
  const allBitsSet = ( 1 << numItems ) - 1 ;
  const explorationQueue = [ ] ;
  const visitedStates = Array( allBitsSet + 1 ).fill( false ) ;
  for ( let i = 0 ; i < numItems ; i++ ) {
    const { firstChar , currentBalance } = itemRecords[i] ;
    if ( firstChar === ')' || currentBalance < 0 ) {
      continue ;
    }
    explorationQueue.push( { maskUsed : ( 1 << i ) , currentTotal : currentBalance } ) ;
  }
  while ( explorationQueue.length > 0 ) {
    const activeEntry = explorationQueue.pop() ;
    for ( let nextItemIndex = 0 ; nextItemIndex < numItems ; nextItemIndex++ ) {
      if ( activeEntry.maskUsed & ( 1 << nextItemIndex ) ) continue ;
      const newMask = activeEntry.maskUsed | ( 1 << nextItemIndex ) ;
      const newTotal = activeEntry.currentTotal + itemRecords[nextItemIndex].currentBalance ;
      if ( newMask === allBitsSet ) {
        if ( itemRecords[nextItemIndex].lastChar === ')' && newTotal === 0 ) {
          return 'Yes' ;
        } else {
          continue ;
        }
      }
      if ( visitedStates[newMask] && newTotal < 0 ) {
        continue ;
      }
      visitedStates[newMask] = true ;
      explorationQueue.push( { maskUsed : newMask , currentTotal : newTotal } ) ;
    }
  }
  return 'No' ;
} ( require('fs').readFileSync('/dev/stdin', 'utf8') ) ) ) ;