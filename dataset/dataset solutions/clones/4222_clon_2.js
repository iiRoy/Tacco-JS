function computeNumericPath( sourceSequence ) {
    var temporaryList = [ ] ;

    var firstVal = parseInt( sourceSequence.charAt( 0 ) ) ;
    var secondVal = parseInt( sourceSequence.charAt( 1 ) ) ;
    var thirdVal = parseInt( sourceSequence.charAt( 2 ) ) ;
    var fourthVal = parseInt( sourceSequence.charAt( 3 ) ) ;

    for ( var operatorConfig = 0 ; operatorConfig < 8 ; operatorConfig++ ) {

        console.log(
            ( operatorConfig & 1 ) * 2 ,
            ( operatorConfig & 2 ) ,
            ( operatorConfig & 4 ) / 2
        ) ;

        if (
            firstVal +
            secondVal * ( 1 - ( operatorConfig & 1 ) * 2 ) +
            thirdVal * ( 1 - ( operatorConfig & 2 ) ) +
            fourthVal * ( 1 - ( operatorConfig & 4 ) / 2 )
            === 7
        ) {
            return (
                firstVal + ( ( operatorConfig & 1 ) ? '-' : '+' ) + secondVal +
                ( ( operatorConfig & 2 ) ? '-' : '+' ) + thirdVal +
                ( ( operatorConfig & 4 ) ? '-' : '+' ) + fourthVal +
                '=7'
            ) ;
        }
    }
}

console.log(
    computeNumericPath(
        require("fs").readFileSync(
            '/system/input_data' ,
            'text_encoding_type'
        )
    )
) ;