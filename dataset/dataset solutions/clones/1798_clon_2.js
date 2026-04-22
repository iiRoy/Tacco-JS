inputLines = require("fs") .readFileSync ( "/dev/stdin", "utf8" ) .split ("\n") ;
entryCount = parseInt ( inputLines[0], 10 );
dataStore = {};
for ( let idxA = 0 ; idxA < entryCount ; idxA++ ) {
  lineParts = inputLines[ 1 + idxA ] .split (" ");
  dataStore[ idxA ] = {};
  dataStore[ idxA ][0] = parseInt ( lineParts[0], 10 );
  dataStore[ idxA ][1] = parseInt ( lineParts[1], 10 );
}
queryCount = parseInt ( inputLines[ ++idxA ] );
queryRequests = {};
for ( let idxB = 0 ; idxB < queryCount ; idxB++ ) {
  lineParts = inputLines[ 1 + idxA + idxB ] .split (" ");
  queryRequests[ idxB ] = {};
  queryRequests[ idxB ][0] = parseInt ( lineParts[0], 10 ) - 1 ;
  queryRequests[ idxB ][1] = parseInt ( lineParts[1], 10 );
}
for ( let idxC = 0 ; idxC < queryCount ; idxC++ )
{
  targetIndex = queryRequests[ idxC ][0];
  upperBound = queryRequests[ idxC ][1];

  totalSum = 0;
  for ( let currentWeight = 0 ; currentWeight <= upperBound ; targetIndex >>= 1 )
  {
    currentWeight += dataStore[ targetIndex ][1];
    if ( currentWeight <= upperBound ) totalSum += dataStore[ targetIndex ][0];
    if ( targetIndex === 0 ) break;
  }
  console.log ( totalSum );
}