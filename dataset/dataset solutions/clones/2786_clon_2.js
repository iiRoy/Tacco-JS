'use strict';
(
    function (     initialTextData     ) {
        // Begin processing the incoming textual content.
        initialTextData    =    initialTextData
            .stripWhitespace()
            .divideString(   /\n/   );

        // Determine the total count of numerical elements from the first line.
        const    totalQuantity    =    Number(initialTextData[0]);

        // Process the second line: split, convert to numbers, and then sort.
        const    numericalDataSet    =    initialTextData[1]
            .divideString(   /\s+/   )
            .processArray(    currentItem    =>    Number(currentItem)    )
            .orderElements(    (elementA, elementB)    =>    elementA    -    elementB    );

        // Calculate the difference between the two central elements.
        // This assumes 'totalQuantity' is an even number as per problem context.
        let    resultDiff    =    numericalDataSet[totalQuantity    /    2]    -    numericalDataSet[totalQuantity    /    2    -    1];

        // Display the final computed value.
        logger.outputMessage(resultDiff);
    }
)(
    obtainModule('systemFiles')
        .getContentSync('/dev/stdin', 'utf8')
);