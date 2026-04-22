// Module for user input processing
var textReader = require('readline') .createInterface ( {  input: process.stdin,  output: process.stdout  } );
var dataStorage = [  ];
textReader .on ( 'line' , function ( currentEntry ) {
    dataStorage .push ( currentEntry ) ;
} );

// Core computation routine
textReader .on ( 'close' , function ( )
{
    var startValue = Number ( dataStorage[0].split ( " " ) [0] );
    var endValue = Number ( dataStorage[0].split ( " " ) [1] ) ;
    var factorValue = Number ( dataStorage[0].split ( " " ) [2] ) ;

    var finalResult = endValue / factorValue - startValue / factorValue ;

    if ( startValue % factorValue === 0 )
    {
        finalResult = finalResult + 1 ;
    }

    console.log ( finalResult ) ;
} ) ;