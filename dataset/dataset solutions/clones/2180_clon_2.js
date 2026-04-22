"use strict" ;

function processInputData ( rawLines )
{

    // Extracting the window configuration parameter from the first line
    let windowSizeParam = rawLines [ 0 ] . split ( " " ) ;

    windowSizeParam = windowSizeParam [ 1 ] ;


    // Parsing the sequence of numbers from the second line
    let numberStrings = rawLines [ 1 ] . split ( " " ) ;


    /*
     * Pre-calculating adjusted values for each element.
     * This step computes (element_value + 2) / 2 for each item.
     */
    let calculatedProbs = [ ] ;
    for ( let index = 0 ; index < numberStrings . length ; index ++ )
    {
        calculatedProbs [ index ] = ( 2 + parseInt ( numberStrings [ index ] , 10 ) ) / 2 ;
    }


    // Computing the cumulative sum (prefix sum) array
    let prefixSums = [ 0 ] ;
    for ( let currPos = 0 ; currPos < numberStrings . length ; currPos ++ )
    {
        prefixSums [ currPos + 1 ] = prefixSums [ currPos ] + calculatedProbs [ currPos ] ;
    }


    // Determining the maximum sum within any contiguous sub-array of specified size
    let overallMaximum = 0 ;
    for ( let endIdx = windowSizeParam - 1 ; endIdx < numberStrings . length ; endIdx ++ )
    {
        let currentSegmentSum = prefixSums [ endIdx + 1 ] - prefixSums [ endIdx - windowSizeParam + 1 ] ;
        overallMaximum = ( overallMaximum < currentSegmentSum ) ? currentSegmentSum : overallMaximum ;
    }

    // Outputting the final result
    console . log ( overallMaximum ) ;
}

processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;