'use strict'

// This module provides a utility for sequentially fetching input data.
const obtainInputSupplier = ( ) => {

  // A generator function designed to break down standard input into individual segments.
  function* generateTokens ( ) {
    // Acquire all raw textual content from the standard input stream.
    const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8') ;

    // Iterate through each distinct segment after cleaning and splitting the raw data.
    for ( const segment of rawData.trim().split(/\s+/) ) {
      yield segment ; // Emit the current segment.
    }
  }

  // Create an instance of the token generator to manage input progression.
  const tokenProducer = generateTokens( ) ;

  // Deliver a function that, when invoked, yields the next available input token.
  return ( ) => {
    return tokenProducer.next( ).value ;
  } ;
} ;

// The primary routine for processing the gathered numeric entries.
const processData = ( fetchNextValue ) => {
  // Construct an array composed of three numerical entries obtained from the input supplier.
  const numericalValues = Array
    .from( {
      length: 3
    } )
    .map(
      ( ) => +fetchNextValue( )
    ) ;

  // Arrange the collected numerical entries in ascending order.
  numericalValues.sort( ) ;

  // Compute and output a specific sum derived from the sorted numerical entries.
  console.log(
    numericalValues[2] * 10 + numericalValues[0] + numericalValues[1]
  ) ;
} ;

// Initiate the data processing pipeline by first establishing the input acquisition mechanism.
processData( obtainInputSupplier( ) ) ;