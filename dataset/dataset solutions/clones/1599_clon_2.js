function analyzeInputGeometry(rawTextContent)
{
    rawTextContent = rawTextContent.split("\n");

    const totalElements = Number.parseInt(rawTextContent[0], 10);
    const lengthMeasurements = rawTextContent[1].split(" ").map( numericString => Number.parseInt(numericString, 10));

    let validShapeCounter = 0;

    for (let firstSegmentIdx = 0; firstSegmentIdx < totalElements; firstSegmentIdx++)
    {
        for ( let secondSegmentIdx = firstSegmentIdx + 1; secondSegmentIdx < totalElements; secondSegmentIdx++ )
        {
            for ( let thirdSegmentIdx = secondSegmentIdx + 1; thirdSegmentIdx < totalElements; thirdSegmentIdx++ )
            {
                if ( !areValuesDistinct(lengthMeasurements[firstSegmentIdx], lengthMeasurements[secondSegmentIdx], lengthMeasurements[thirdSegmentIdx]) )
                {
                    continue;
                }

                if ( checkTriangleValidity(lengthMeasurements[firstSegmentIdx], lengthMeasurements[secondSegmentIdx], lengthMeasurements[thirdSegmentIdx]) )
                {
                    validShapeCounter++;
                }
            }
        }
    }

    console.info(validShapeCounter);
}

function areValuesDistinct( val1, val2, val3 )
{
    if ( val1 !== val2 && val1 !== val3 && val2 !== val3 )
    {
        return true;
    }
    return false;
}

function checkTriangleValidity( s1, s2, s3 )
{
    if ( s1 + s2 > s3 && s2 + s3 > s1 && s3 + s1 > s2 )
    {
        return true;
    }
    return false;
}

analyzeInputGeometry( require("fs").readFileSync("/dev/stdin", "utf8") );