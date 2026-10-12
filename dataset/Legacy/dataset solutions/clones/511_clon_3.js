process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(rawData){
    var loopIdx;
    var inputLines = rawData.trim().split("\n");

    for(var lineIterator = 0; lineIterator < inputLines.length; ++lineIterator){
        var numElements;
        var dataPointsStrArray;
        var prevVal, currVal;
        var diffMap;

        numElements = parseInt(inputLines[lineIterator++], 10);
        if( numElements === 0 ) break;

        diffMap = new Array(numElements + 1);
        dataPointsStrArray = inputLines[lineIterator].trim().split(" ");

        // Type III: Pre-parse all data points into a numeric array to avoid repeated parseInt calls
        const numericDataPoints = dataPointsStrArray.map(val => parseInt(val, 10));

        // Calculate the first difference
        prevVal = numericDataPoints[0];
        currVal = numericDataPoints[1];
        diffMap[1] = currVal - prevVal;

        // Update prevVal for the subsequent loop
        prevVal = currVal;

        // Loop to calculate remaining differences
        for(loopIdx = 2; loopIdx < numericDataPoints.length; ++loopIdx){
            currVal = numericDataPoints[loopIdx];
            diffMap[loopIdx] = currVal - prevVal;
            prevVal = currVal;
        }

        // Type III: Introduce helper variables for frequently accessed differences
        const diff1 = diffMap[1];
        const diff2 = diffMap[2];
        const diff3 = diffMap[3];
        const diff4 = diffMap[4];

        // Type III: Introduce helper variables for frequently accessed numeric data points
        const val0 = numericDataPoints[0];
        const val1 = numericDataPoints[1];
        const val2 = numericDataPoints[2];
        const val3 = numericDataPoints[3];
        const val4 = numericDataPoints[4];

        // Type III: Break down complex conditions into intermediate boolean variables for clarity
        const areFirstFourDiffsEqual = (diff1 === diff2 && diff2 === diff3 && diff3 === diff4);
        const areLastThreeDiffsEqual = (diff2 === diff3 && diff3 === diff4);
        const areFirstThreeDiffsEqual = (diff1 === diff2 && diff2 === diff3);

        if(areFirstFourDiffsEqual){
            for(loopIdx = 5; loopIdx <= numElements; ++loopIdx){
                if(diffMap[loopIdx] !== diff1) break;
            }
            console.log(dataPointsStrArray[loopIdx]);
        }
        else if(areLastThreeDiffsEqual){
            console.log(dataPointsStrArray[0]);
        }
        else if(areFirstThreeDiffsEqual){
            console.log(dataPointsStrArray[4]);
        }
        else if(diff2 - val0 === diff3 && diff3 === diff4){
            console.log(dataPointsStrArray[1]);
        }
        else if(diff1 === diff2 && diff2 === val4 - val2){
            console.log(dataPointsStrArray[3]);
        }
        else if(diff1 === val3 - val1 && diff1 === diff4){
            console.log(dataPointsStrArray[2]);
        }
    }
});
