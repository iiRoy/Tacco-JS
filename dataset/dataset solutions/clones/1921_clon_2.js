"use strict";

const   processInput   =   (rawData)   =>   {
    const   linesArray   =   rawData . trim() . split("\n");

    const   [ countA ,   limitB ,   queryCount ]   =   linesArray[0] . split(" ") . map(itemStr   =>   parseInt(itemStr,   10));
    let   constraintList   =   [];
    for (let   idx   =   1;   idx   <=   queryCount;   idx++)   {
        constraintList . push(linesArray[idx] . split(" ") . map(numStr   =>   parseInt(numStr,   10)));
    }
    let   maxScore   =   0;
    const   exploreCombinations   =   function(startValue,   currentSequence)   {
        if   (currentSequence . length   ===   countA)   {
            let   currentScore   =   0;
            for   (let   k   =   0;   k   <   queryCount;   k++)   {
                if   (currentSequence[constraintList[k][1]-1]   -   currentSequence[constraintList[k][0]-1]   ===   constraintList[k][2])   {
                    currentScore   +=   constraintList[k][3];
                }
            }
            maxScore   =   Math . max(maxScore,   currentScore);
            return;
        }
        for   (let   val   =   startValue;   val   <=   limitB;   val++)   {
            currentSequence . push(val);
            exploreCombinations(val,   currentSequence);
            currentSequence . pop();
        }
    };
    exploreCombinations(1,   []);
    console . log(maxScore);
};
processInput(require('fs') . readFileSync('/dev/stdin', 'utf8'));