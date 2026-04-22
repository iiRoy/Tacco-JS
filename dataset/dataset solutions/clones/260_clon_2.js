// Program parameters configuration
let config = {};

// Two-dimensional array representing path segments. Values: -1 (right of bar), 0 (empty), 1 (left of bar)
let segmentMap = [];

// Traces a path from a given starting point
const tracePathFromStart = function ( initialRow, startingColumn )
{
    if ( !startingColumn ) startingColumn = 0;
    
    let currentLane = initialRow;
    const laneHistory = [currentLane];

    for ( let colIdx = startingColumn; colIdx < segmentMap.length; colIdx++ )
    {
        currentLane += segmentMap[colIdx][currentLane];
        laneHistory.push(currentLane);
    }

    return laneHistory;
};

// Obtains a path starting from the end goal (path is presented from start to end)
const retrieveReverseJourney = function ( finalRowIndex )
{
    let currentLaneIndex = finalRowIndex;
    const reverseSequence = [ currentLaneIndex ];

    for ( let rowIndex = segmentMap.length - 1; rowIndex >= 0; rowIndex-- )
    {
        currentLaneIndex += segmentMap[rowIndex][currentLaneIndex];
        reverseSequence.push( currentLaneIndex );
    }

    return reverseSequence.reverse();
};

let receivedLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function ( dataBlock )
{
    dataBlock
        .trim()
        .split('\n')
        .forEach(function( singleLine ) {
            receivedLines.push(singleLine);
        });
});
 
process.stdin.on('end', function()
{
    let outputString = "";
	
    // Data structure initialization and population
    config = {};
    segmentMap = [];

    for ( let linePosition = 0; linePosition < receivedLines.length; linePosition++ )
    {
        const currentLineContent = receivedLines[linePosition];
        if ( currentLineContent === "0" ) {
            return false;
        }
	
        const parameterNames = ["lines", "start", "end", "steps"];

        if ( linePosition < parameterNames.length )
        {
            config[parameterNames[linePosition]] = parseInt(currentLineContent);
            return;
        }
	
        // For linePosition >= 4, processing segment data
        let pathSegmentRow = [];
        for ( let segmentCol = 0; segmentCol < config.lines - 1; segmentCol++ )
        {
            const segmentValue = parseInt(currentLineContent.charAt(segmentCol));
            if ( segmentCol > 0 && segmentValue === 0 && pathSegmentRow[segmentCol - 1] === 1 ) {
                // Adjusting segment value for connected bars
                segmentValue = -1;
            }
            pathSegmentRow.push(segmentValue);
        }
        pathSegmentRow.push((pathSegmentRow[pathSegmentRow.length - 1] === 1) ? -1 : 0);
        segmentMap.push(pathSegmentRow);
    }

    config.start -= 1;
    config.end -= 1;


    const primaryPath = tracePathFromStart(config.start);

    if ( primaryPath[primaryPath.length - 1] === config.end )
    {
        console.log("0");
        return;
    }

    const goalPath = retrieveReverseJourney(config.end);
	
    for ( let currentVerticalPosition = 0; currentVerticalPosition < config.steps; currentVerticalPosition++ )
    {
        // Check if paths are adjacent and segments are empty at this position
        if ( Math.abs(primaryPath[currentVerticalPosition] - goalPath[currentVerticalPosition]) === 1 &&
             segmentMap[currentVerticalPosition][primaryPath[currentVerticalPosition]] === 0 &&
             segmentMap[currentVerticalPosition][goalPath[currentVerticalPosition]] === 0 )
        { 
            outputString = (currentVerticalPosition + 1) + " " + (Math.min(primaryPath[currentVerticalPosition], goalPath[currentVerticalPosition]) + 1);
            break;
        }
    }

    if ( outputString === "" ) {
        outputString = "1";
    }
	
    console.log(outputString);
});