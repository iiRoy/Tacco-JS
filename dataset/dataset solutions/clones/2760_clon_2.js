"use strict";

  const executeProgram = ( inputString ) => {

    let numericValues = inputString
      .split( " " )
      .map( ( strNum ) => Number( strNum ) );

    let passengerCount = numericValues[ 0 ];
    let ticketPrice    = numericValues[ 1 ];
    let cabFare        = numericValues[ 2 ];

    let finalCost =
      passengerCount * ticketPrice > cabFare
        ? cabFare
        : passengerCount * ticketPrice;

    console.log( finalCost );
  };

  executeProgram(
    require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' )
  );