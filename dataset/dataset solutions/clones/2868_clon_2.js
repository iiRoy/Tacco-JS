"use strict" ;

// This module determines the maximum area illuminated by a single light source within a given grid layout.
function ProcessGrid(rawGridData)
{
    rawGridData  =  rawGridData.split('\n') ;

    // Parse grid dimensions from the first line.
    let   gridDimensions  =  rawGridData.shift().split(' ').map(function (componentStr)
    {
        return Number.parseInt(componentStr, 10) ; // Explicit radix for robustness
    }) ;

    // Transform each line segment into an array of characters representing grid cells.
    rawGridData.forEach(  function  (lineSegment,  segmentIndex, allSegments) {
        allSegments[segmentIndex]  =  allSegments[segmentIndex].split('') ;
    }) ;

    let peakIlluminationCount = 0 ; // Stores the highest count of lit cells found so far.

    // Iterate through every cell in the grid to find potential light source positions.
    for  (  let rowIdx = 0 ;  rowIdx < rawGridData.length ;  rowIdx++  )
    {
        for  (  let colIdx = 0 ;  colIdx < rawGridData[0].length ;  colIdx++  )
        {
            // If the current cell is an open space ('.'), it can host a light source.
            if  (  rawGridData[rowIdx][colIdx]  ===  '.'  )
            {
                // Calculate the illumination range for the current potential source.
                let currentIllumination = calculateIlluminationReach( rawGridData, [colIdx, rowIdx] ) ;
                // Update the maximum if the current illumination is greater.
                peakIlluminationCount   =  (  peakIlluminationCount  >  currentIllumination  )  ?  peakIlluminationCount  :  currentIllumination ;
            }
        }
    }

    let finalResult = peakIlluminationCount ; // The ultimate answer to be displayed.
    console.log(finalResult) ; // Output the final maximum illumination value.
}

// Computes the number of cells illuminated by a light source at a specific position.
function calculateIlluminationReach(layoutMatrix, sourceCoords)
{
    // Extract X and Y coordinates of the light source.
    let sourceX = sourceCoords[0] , sourceY = sourceCoords[1] ;

    // Start with 1 for the source cell itself.
    let illuminatedSquares = 1 ;

    // Check cells in the upward direction (decreasing Y).
    for  (  let iteratorVar = sourceY - 1 ;  iteratorVar >= 0 ;  iteratorVar--  )  {
        if  (  layoutMatrix[iteratorVar][sourceX]  ===  '.'  )  illuminatedSquares++ ;
        else  if  (  layoutMatrix[iteratorVar][sourceX]  ===  '#'  )  break ; // Blocked by an obstacle.
    }

    // Check cells in the downward direction (increasing Y).
    for  (  let iteratorVar = sourceY + 1 ;  iteratorVar < layoutMatrix.length ;  iteratorVar++  )  {
        if  (  layoutMatrix[iteratorVar][sourceX]  ===  '.'  )  illuminatedSquares++ ;
        else  if  (  layoutMatrix[iteratorVar][sourceX]  ===  '#'  )  break ; // Stop at first obstacle.
    }

    // Check cells in the leftward direction (decreasing X).
    for  (  let iteratorVar = sourceX - 1 ;  iteratorVar >= 0 ;  iteratorVar--  )  {
        if  (  layoutMatrix[sourceY][iteratorVar]  ===  '.'  )  illuminatedSquares++ ;
        else  if  (  layoutMatrix[sourceY][iteratorVar]  ===  '#'  )  break ; // Obstacle encountered.
    }

    // Check cells in the rightward direction (increasing X).
    for  (  let iteratorVar = sourceX + 1 ;  iteratorVar < layoutMatrix[0].length ;  iteratorVar++  )  {
        if  (  layoutMatrix[sourceY][iteratorVar]  ===  '.'  )  illuminatedSquares++ ;
        else  if  (  layoutMatrix[sourceY][iteratorVar]  ===  '#'  )  break ; // Path blocked.
    }

    return illuminatedSquares ; // Return the total count of lit cells.
}

ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8")) ;