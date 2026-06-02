'use strict';

function processRawInput(rawString) {
    const cleanedString = rawString.trim();
    const stringParts = cleanedString.split(/\s+/);
    return stringParts.map(Number);
}

function createExpectedValueTable(sizeLimit) {
    const tableDimensions = sizeLimit + 2;
    const dpTable = new Array(tableDimensions);

    for (let dim1Idx = -1; dim1Idx < tableDimensions; dim1Idx++) {
        dpTable[dim1Idx] = new Array(tableDimensions - dim1Idx);
        for (let dim2Idx = -1; dim2Idx < tableDimensions - dim1Idx; dim2Idx++) {
            dpTable[dim1Idx][dim2Idx] = new Array(tableDimensions - dim1Idx - dim2Idx).fill(0);
            dpTable[dim1Idx][dim2Idx][-1] = 0;
        }
    }
    return dpTable;
}

(function(rawInputString){
    let numericData = processRawInput(rawInputString);

    const totalItemsCount = numericData.shift();
    
    const itemCategoryCounts = [null, 0, 0, 0]; 
    
    numericData.forEach(function(currentValue){
        if (currentValue >= 1 && currentValue <= 3) {
            itemCategoryCounts[currentValue]++;
        }
    });

    const expectedValueTable = createExpectedValueTable(totalItemsCount);
    
    for (let c1 = 1; c1 <= totalItemsCount; c1++) {
        const probOfDrawingAnyItem = totalItemsCount / c1;

        expectedValueTable[c1][0][0] = expectedValueTable[c1 - 1][0][0] + probOfDrawingAnyItem;

        for (let c2 = 1; c2 <= c1; c2++) {
            const probOfDrawingItem2 = c2 / c1;
            const probOfDrawingItem1 = (c1 - c2) / c1;

            const termFromDrawing2_c3_0 = expectedValueTable[c1 - c2 + 1][c2 - 1][0] * probOfDrawingItem2;
            const termFromDrawing1_c3_0 = expectedValueTable[c1 - c2 - 1][c2][0] * probOfDrawingItem1;
            expectedValueTable[c1 - c2][c2][0] = probOfDrawingAnyItem + termFromDrawing2_c3_0 + termFromDrawing1_c3_0;

            for (let c3 = 1; c3 <= c2; c3++) {
                const probOfDrawingItem3 = c3 / c1;
                const probOfDrawingItem2_inner = (c2 - c3) / c1;

                const termFromDrawing3 = expectedValueTable[c1 - c2][c2 - c3 + 1][c3 - 1] * probOfDrawingItem3;
                const termFromDrawing2 = expectedValueTable[c1 - c2 + 1][c2 - 1 - c3][c3] * probOfDrawingItem2_inner;
                const termFromDrawing1 = expectedValueTable[c1 - c2 - 1][c2 - c3][c3] * probOfDrawingItem1;

                expectedValueTable[c1 - c2][c2 - c3][c3] = probOfDrawingAnyItem + termFromDrawing3 + termFromDrawing2 + termFromDrawing1;
            }
        }
    }
    
    console.log(expectedValueTable[itemCategoryCounts[1]][itemCategoryCounts[2]][itemCategoryCounts[3]]);

})(require('fs').readFileSync('/dev/stdin','utf8'));
