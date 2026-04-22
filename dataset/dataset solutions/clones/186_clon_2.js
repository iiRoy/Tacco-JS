const   fileSystemModule = require( 'fs' );

let     inputRecords = fileSystemModule
        .readFileSync( '/dev/stdin' ,  'utf8' )
        .split( "\n" );

inputRecords.sort(
    function ( valOne ,   valTwo )
    {
        return  valTwo  -   valOne ;
    }
);

console.log(
    (
        ( Number(inputRecords[0].replace('.', '')) )
        -
        ( Number(inputRecords[inputRecords.length - 1].replace('.', '')) )
    )
    /
    10
);