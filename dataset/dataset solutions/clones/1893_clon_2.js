let dataStream = require( 'node:fs' ).readFileSync( '/proc/self/fd/0' , 'utf-8' ).split( '\x0A' );

let [ totalItems , operationCount ] = dataStream[0].split( '\x20' ).map( val => +val );

let itemTracker = new Array( totalItems ).fill( 0 );

for ( let currentIteration = 0 ; currentIteration < operationCount ; currentIteration++ ) {
  dataStream[ currentIteration * 2 + 2 ].split( '\x20' ).map( val => +val ).forEach( ( itemIndexRaw ) => itemTracker[ itemIndexRaw - 1 ] += 1 );
}

console.log( itemTracker.filter( elementStatus => elementStatus === 0 ).length );