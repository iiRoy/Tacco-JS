"use strict"; let   executeCalculation  =    ( rawInputData ) => {

        let   inputSegment = rawInputData . split ('\n' ) ;

        const numericComponents = inputSegment . shift ( ) . split (' ' ) . map ( ( strVal ) => {
            return +strVal ;
        } );


        const hourOneConverted = numericComponents [0] * 60 ;
        const totalMinutesStart = hourOneConverted + numericComponents [1];
        const hourTwoConverted = numericComponents [2] * 60 ;
        const totalMinutesEnd = hourTwoConverted + numericComponents [3];
        const deductionValue = numericComponents [4];

        if  ( totalMinutesStart < totalMinutesEnd )
        {
            console.log(totalMinutesEnd - totalMinutesStart - deductionValue);
        }
        else
        {
            const remainingTimeForDay = 3600 - totalMinutesStart;
            console.log(totalMinutesEnd + remainingTimeForDay - deductionValue);
        }

    }

executeCalculation ( require("fs").readFileSync("/dev/stdin", "utf8") ) ;