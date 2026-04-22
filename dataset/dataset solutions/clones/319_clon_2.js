var sourceDataStream = require('fs') .readFileSync( '/dev/stdin', 'utf8' ) ;
var textualRecords = ( sourceDataStream . trim ( ) ) . split ( "\n" ) ;

var globalIndexA ;

// Main processing loop for each block of data
for ( globalIndexA = 0 ; globalIndexA < textualRecords . length ; ++ globalIndexA )
{

  var currentBlockSize = parseInt ( textualRecords [ globalIndexA ] ) ;

  // If the current block size is zero, terminate processing
  if ( currentBlockSize === 0 ) {
    break ;
  }
  else
  {
    var isMatchFound , collectionLength , itemPointer ;
    var firstOperandLen , secondOperandLen , totalProductLen , globalIndexB , overflowDigit , intermediateCalculation ;

    // Initialize an array to store identifiers that meet the criteria
    var approvedIdentifiers = [ ] ;

    // Loop through each entry within the current data block
    for ( var globalIndexB = 0 ; globalIndexB < currentBlockSize ; ++ globalIndexB )
    {
      // Extract the current entry data, advancing the main record cursor
      var currentInputSet = textualRecords [ ++ globalIndexA ] . split ( ' ' ) ;

      var operandOneDigits , operandTwoDigits ;

      // Determine which number is longer for multiplication setup
      if ( currentInputSet [ 1 ] . length > currentInputSet [ 2 ] . length )
      {
        firstOperandLen = currentInputSet [ 1 ] . length ;
        secondOperandLen = currentInputSet [ 2 ] . length ;
        operandOneDigits = currentInputSet [ 1 ] . split ( '' ) ;
        operandTwoDigits = currentInputSet [ 2 ] . split ( '' ) ;
      }
      else
      {
        firstOperandLen = currentInputSet [ 2 ] . length ;
        secondOperandLen = currentInputSet [ 1 ] . length ;
        operandOneDigits = currentInputSet [ 2 ] . split ( '' ) ;
        operandTwoDigits = currentInputSet [ 1 ] . split ( '' ) ;
      }

      isMatchFound = 0 ;
      totalProductLen = firstOperandLen + secondOperandLen ;

      // Check if the product could potentially be a "big number" (length >= 7)
      if ( totalProductLen >= 7 )
      {
        // Allocate a buffer for the multiplication result
        var outputProductBuffer = new Array ( totalProductLen + 1 ) ;
        // Initialize the buffer elements to zero
        for ( globalIndexB = 0 ; globalIndexB <= totalProductLen ; ++ globalIndexB )
        {
          outputProductBuffer [ globalIndexB ] = 0 ;
        }

        // Perform "long multiplication" digit by digit
        for ( globalIndexB = firstOperandLen - 1 ; globalIndexB >= 0 ; -- globalIndexB )
        {
          for ( overflowDigit = 0, globalIndexA = secondOperandLen - 1 ; globalIndexA >= 0 ; -- globalIndexA )
          {
            intermediateCalculation = parseInt ( operandOneDigits [ globalIndexB ] ) * parseInt ( operandTwoDigits [ globalIndexA ] ) + outputProductBuffer [ globalIndexA + globalIndexB + 1 ] + overflowDigit ;
            outputProductBuffer [ globalIndexA + globalIndexB + 1 ] = intermediateCalculation % 10 ;
            overflowDigit = parseInt ( intermediateCalculation / 10 ) ;
          }
          outputProductBuffer [ globalIndexB ] = overflowDigit ;
        }

        // Find the first non-zero digit in the product buffer
        for ( globalIndexB = 0 ; globalIndexB <= totalProductLen ; ++ globalIndexB )
        {
          if ( outputProductBuffer [ globalIndexB ] > 0 ) break ;
        }

        // If the effective length of the product is 7 or more, mark as found
        if ( totalProductLen - globalIndexB >= 7 )
        {
          isMatchFound = 1 ;
        }
      }

      // If a "big number" product was detected for this entry
      if ( isMatchFound )
      {
        isMatchFound = 0 ; // Reset flag for checking existing entries

        // Check if this identifier is already in the approved list
        for ( itemPointer = 0, collectionLength = approvedIdentifiers . length ; itemPointer < collectionLength ; ++ itemPointer )
        {
          if ( approvedIdentifiers [ itemPointer ] == currentInputSet [ 0 ] )
          {
            isMatchFound = 1 ; // Identifier already present
            break ;
          }
        }

        // If the identifier is new, add it to the approved list
        if ( isMatchFound === 0 )
        {
          approvedIdentifiers . push ( currentInputSet [ 0 ] ) ;
        }
      }
    }

    collectionLength = approvedIdentifiers . length ;
    // Output results based on whether any identifiers were approved
    if ( collectionLength === 0 )
    {
      console . log ( "NA" ) ;
    }
    else
    {
      // Print each approved identifier
      for ( itemPointer = 0 ; itemPointer < collectionLength ; ++ itemPointer )
      {
        console . log ( approvedIdentifiers [ itemPointer ] ) ;
      }
    }
  }
}