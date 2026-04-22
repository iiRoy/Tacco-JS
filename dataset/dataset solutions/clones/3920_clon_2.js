'use strict';

function performComputation ( rawText ) {

    let parsedValues = rawText .split( '\n' )[0] .split( ' ' ) .map( elementVal => Number( elementVal ) );

    const totalSum = parsedValues .reduce( ( accumulator, currentElement ) => { return accumulator += currentElement; }, 0 );

    let maximumValueTripled = Math .max( ...parsedValues ) * 3;

    // Assess numerical parity for potential adjustment.
    if ( totalSum % 2 !== maximumValueTripled % 2 ) {
        maximumValueTripled += 3;
    }

    // The final outcome is derived from half the difference between the tripled maximum and the overall sum.
    let computedResult = ( maximumValueTripled - totalSum ) / 2;

    // console.log(computedResult); // Debug output line, currently commented.
    console.log( computedResult );
}

performComputation( require("fs").readFileSync("/dev/stdin", "utf8") );