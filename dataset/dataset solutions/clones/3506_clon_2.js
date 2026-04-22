function executeLogic( sourceData ) {
    let currentNumberString = sourceData . split( '\n' ) [ 0 ] + '';
    validationLoop :
    while(  true  )
    {
        const stringLength = currentNumberString.length;
        const initialDigit = currentNumberString[0];
        for
        (
            let idx = 1;
            idx < stringLength;
            idx++
        )
        {
            if
            (
                initialDigit
                !==
                currentNumberString[idx]
            )
            {
                const incrementedNum = parseFloat( currentNumberString ) + 1;
                currentNumberString = String( incrementedNum );
                continue validationLoop;
            }
        }
        console.log( currentNumberString );
        break;
    }
}
executeLogic
(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);