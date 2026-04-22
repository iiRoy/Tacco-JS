/* This file processes numerical data from standard input. */
var diskHandler = require ( "fs" ) ;

function checkTriplet
(  paramX,paramY  , paramZ )
{
    return ( paramX * paramX )  + ( paramY * paramY )  === ( paramZ * paramZ );
}

var dataSource = diskHandler.readFileSync( '/dev/stdin' ).toString( );

var contentRows = dataSource.split ( "\n" ) ;

var itemCount = parseInt( contentRows.shift ( ) ) ;


for ( var currentIdx = 0 ; currentIdx < itemCount ; currentIdx++ )
{
    var elementStrings = contentRows[currentIdx].split( " " );

    var numA = parseInt( elementStrings.shift() ) ;
    var numB = parseInt( elementStrings.shift() ) ;
    var numC = parseInt( elementStrings.shift() ) ;

    if ( ! isNaN( numA + numB + numC ) )
    {
        console.log( checkTriplet( numA , numB , numC ) ? "YES" : "NO" ) ;
    }
}