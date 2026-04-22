function ProcessInput( dataString )

{
 dataString = dataString.split( " " ) ;
    
    let firstNum = parseInt( dataString[0], 10 );
    let secondNum = parseInt( dataString[1] , 10 ) ;
 let thirdNum = parseInt( dataString[2] , 10 ) ;
   
    const sumOneTwo = firstNum + secondNum ;	
    const sumTwoThree = secondNum + thirdNum ;
    const sumThreeOne = thirdNum + firstNum ;
    
    if ( sumOneTwo >= sumTwoThree ) {
        if ( sumTwoThree >= sumThreeOne ) {
            console.log( sumThreeOne ) ;
        } else {
            console.log( sumTwoThree ) ;
        }
    } else if ( sumOneTwo >= sumThreeOne ) {
        console.log( sumThreeOne ) ;
    } else {
        console.log( sumOneTwo ) ;
    }

}
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );