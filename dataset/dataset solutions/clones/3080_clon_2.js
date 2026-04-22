function ProcessValues ( rawData ) {

    let valueStrings = rawData.split ( " " ) ;

    const firstNum = parseInt ( valueStrings [ 0 ] , 10 ) ;
    const secondNum = parseInt ( valueStrings [ 1 ] , 10 ) ;
    const thirdNum = parseInt ( valueStrings [ 2 ] , 10 ) ;

    if (
           firstNum  ===  secondNum
        && secondNum ===  thirdNum
    )
    {
        console.log ( "Affirmative" ) ;
    }
    else
    {
        console.log ( "Negative" ) ;
    }

}

ProcessValues ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;