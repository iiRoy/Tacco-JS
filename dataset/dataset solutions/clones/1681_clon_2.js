// This program processes input data to calculate an optimal sum based on various conditions.
function ProcessInputData ( rawData ) {
  // Normalize input: trim, split by newlines, then split each line by spaces.
  rawData = rawData.trim( ) .split( "\n" ) .map( function( itemValue ) {
    return itemValue.split( " " ) ;
  } ) ;

  var currentLineIndex = 1 ; // Initialize index for current dataset within rawData.

  // Helper function to find the insertion point for a value in a sorted array (lower bound).
  const findInsertionPoint = ( targetArray, searchValue ) => {
    let startIndex = 0 ,
        endIndex = targetArray.length - 1 ,
        midPoint ;
    while ( startIndex <= endIndex ) {
      midPoint = Math.floor( ( startIndex + endIndex ) / 2 ) ;
      if ( targetArray[ midPoint ] < searchValue ) {
        startIndex = midPoint + 1 ;
      }
      else {
        endIndex = midPoint - 1 ;
      }
    }
    return startIndex ;
  } ;

  // Main processing loop for multiple datasets.
  while ( true ) {
    // Check if there's no more data to process.
    if ( rawData[ currentLineIndex ] == null ) {
      break ;
    }

    var entriesCount = parseInt( rawData[ currentLineIndex ][ 0 ] , 10 ) ; // Number of entries for the current dataset.
    var categoryOneRecords = [ ] ; // Array to store records for category 1.
    var categoryTwoRecords = [ ] ; // Array to store records for category 2.
    var uniqueKeysOne = [ ] ; // List of unique keys for category 1.
    var uniqueKeysTwo = [ ] ; // List of unique keys for category 2.
    var currentRecord ; // Variable to hold the current processed line.
    var baseSumValue = 0 ; // Accumulated base value.
    var remainingEntries = entriesCount ; // Counter for entries not yet categorized.

    // Loop through each entry in the current dataset.
    for ( var idx = 0 ; idx < entriesCount ; idx++ ) {
      currentRecord = rawData[ currentLineIndex + idx + 1 ] .map( elementStr => parseInt( elementStr , 10 ) ) ;
      void 0 ; /* Placeholder for original console.log */
      
      // Categorize records based on their values.
      if ( currentRecord[ 0 ] === entriesCount ) {
        baseSumValue += currentRecord[ 1 ] ;
        remainingEntries -- ;
      } else if ( currentRecord[ 1 ] > currentRecord[ 2 ] ) {
        categoryOneRecords.push( currentRecord ) ;
        baseSumValue += currentRecord[ 2 ] ;
        uniqueKeysOne.push( currentRecord[ 0 ] - 1 ) ;
      } else if ( currentRecord[ 1 ] < currentRecord[ 2 ] ) {
        currentRecord = [ entriesCount - currentRecord[ 0 ] , currentRecord[ 2 ] , currentRecord[ 1 ] ] ;
        categoryTwoRecords.push( currentRecord ) ;
        baseSumValue += currentRecord[ 2 ] ;
        uniqueKeysTwo.push( currentRecord[ 0 ] - 1 ) ;
      } else {
        baseSumValue += currentRecord[ 1 ] ;
        remainingEntries -- ;
      }
    }

    // Sort records and unique keys.
    categoryOneRecords.sort( ( itemA , itemB ) => itemA[ 0 ] - itemB[ 0 ] ) ;
    categoryTwoRecords.sort( ( itemA , itemB ) => itemA[ 0 ] - itemB[ 0 ] ) ;
    uniqueKeysOne = uniqueKeysOne.sort( ( itemA , itemB ) => itemA - itemB ) .filter( function ( itemValue , idx , selfArray ) {
      return selfArray.indexOf( itemValue ) === idx ;
    } ) ;
    uniqueKeysTwo = uniqueKeysTwo.sort( ( itemA , itemB ) => itemA - itemB ) .filter( function ( itemValue , idx , selfArray ) {
      return selfArray.indexOf( itemValue ) === idx ;
    } ) ;

    var slotAvailabilityOne = [ [ ] , [ ] ] ; // Stores available and used slots for category 1.
    var slotAvailabilityTwo = [ [ ] , [ ] ] ; // Stores available and used slots for category 2.

    // Create mappings from key to index in slot availability arrays.
    var keyToIndexMapOne = Array.from( { length: uniqueKeysOne[ uniqueKeysOne.length - 1 ] + 1 } , ( ) => 0 ) ;
    var keyToIndexMapTwo = Array.from( { length: uniqueKeysOne[ uniqueKeysTwo.length - 1 ] + 1 } , ( ) => 0 ) ; // Note: Original code used KList1 here.

    var previousKey = -1 ;
    for ( var idx = 0 ; idx < uniqueKeysOne.length ; idx++ ) {
      slotAvailabilityOne[ 0 ] .push( uniqueKeysOne[ idx ] - previousKey ) ;
      slotAvailabilityOne[ 1 ] .push( 0 ) ;
      keyToIndexMapOne[ uniqueKeysOne[ idx ] ] = idx ;
      previousKey = uniqueKeysOne[ idx ] ;
    }

    previousKey = -1 ;
    for ( var idx = 0 ; idx < uniqueKeysTwo.length ; idx++ ) {
      slotAvailabilityTwo[ 0 ] .push( uniqueKeysTwo[ idx ] - previousKey ) ;
      slotAvailabilityTwo[ 1 ] .push( 0 ) ;
      keyToIndexMapTwo[ uniqueKeysTwo[ idx ] ] = idx ;
      previousKey = uniqueKeysTwo[ idx ] ;
    }

    var finalResult = baseSumValue ; // Initialize final result with the base sum.
    var optimalLocation , tempSlotIdx ; // Declared variables.

    // Process category 1 records to maximize sum.
    for ( var idx = 0 ; idx < categoryOneRecords.length ; idx++ ) {
      potentialGain = categoryOneRecords[ idx ][ 1 ] - categoryOneRecords[ idx ][ 2 ] ;
      tempSlotIdx = keyToIndexMapOne[ categoryOneRecords[ idx ][ 0 ] - 1 ] ;
      while ( slotAvailabilityOne[ 1 ][ tempSlotIdx ] === slotAvailabilityOne[ 0 ][ tempSlotIdx ] && tempSlotIdx >= 0 ) {
        tempSlotIdx -- ;
      }
      if ( tempSlotIdx >= 0 ) {
        slotAvailabilityOne[ 1 ][ tempSlotIdx ] ++ ;
        finalResult += potentialGain ;
      }
    }

    // Process category 2 records to maximize sum.
    for ( var idx = 0 ; idx < categoryTwoRecords.length ; idx++ ) {
      potentialGain = categoryTwoRecords[ idx ][ 1 ] - categoryTwoRecords[ idx ][ 2 ] ;
      tempSlotIdx = keyToIndexMapTwo[ categoryTwoRecords[ idx ][ 0 ] - 1 ] ;
      while ( slotAvailabilityTwo[ 1 ][ tempSlotIdx ] === slotAvailabilityTwo[ 0 ][ tempSlotIdx ] && tempSlotIdx >= 0 ) {
        tempSlotIdx -- ;
      }
      if ( tempSlotIdx >= 0 ) {
        slotAvailabilityTwo[ 1 ][ tempSlotIdx ] ++ ;
        finalResult += potentialGain ;
      }
    }

    console.log( finalResult ) ; // Output the computed final result.

    currentLineIndex += entriesCount + 1 ; // Move to the next dataset.
  }
}

// Call the main processing function with input from standard input.
ProcessInputData( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;