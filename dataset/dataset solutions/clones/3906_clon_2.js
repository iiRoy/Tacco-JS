function ProcessInputData(dataSource)
{
    const stringRows = dataSource.split( '\n' );

    let  elementCountValue = parseInt(stringRows[0] , 10);

    let numberSequence = stringRows[1].split(' ').map( strNum => parseInt(strNum, 10) );

    let sortedSequence = numberSequence.slice().sort( ( valA, valB ) => valA - valB );

    const medianValueOne = sortedSequence[ (elementCountValue / 2) - 1 ];
    const medianValueTwo = sortedSequence[ elementCountValue / 2 ];


    numberSequence.forEach( currentNumber =>
        console.log( currentNumber <= medianValueOne ? medianValueTwo : medianValueOne )
    );
}

const inputBuffer = require('fs') . readFileSync( "/dev/stdin" , "utf-8" );

ProcessInputData(inputBuffer);