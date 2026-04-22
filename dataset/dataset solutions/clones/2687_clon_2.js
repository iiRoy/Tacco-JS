"use strict" ;

const processInput = inputContent => {
    inputContent = inputContent.trim()
                               .split( "\n" ) ;
    const charSequence = inputContent[0].split( "" );

    let rightCount = 0 ;
    let leftCount = 0 ;
    let boundaryPosition ;
    let transitionCounter = 0 ;

    let finalResults = [...Array(charSequence.length)].fill(0.0) ;

    for ( let currentIdx = 0 ;
          currentIdx < charSequence.length - 1 ;
          currentIdx++ ) {

        if ( charSequence[currentIdx] === "R" ) {
            rightCount += 1 ;
        }
        if ( charSequence[currentIdx] === "L" ) {
            leftCount += 1 ;
        }
        
        // This checks for a switch from 'R' to 'L' or vice-versa
        if ( charSequence[currentIdx] !== charSequence[parseInt(currentIdx) + 1] ) {
            transitionCounter += 1 ;
            
            if ( transitionCounter === 1 ) {
                boundaryPosition = currentIdx ;
            }
        }
        
        if ( transitionCounter === 2 ) {
            if ( ( rightCount + leftCount ) % 2 === 0 ) {
                finalResults[boundaryPosition]     = ( rightCount + leftCount ) / 2 ;
                finalResults[boundaryPosition + 1] = ( rightCount + leftCount ) / 2 ;
            } else {
                if ( ( Math.max( rightCount, leftCount ) - 1 ) % 2 === 0 ) {
                    finalResults[boundaryPosition]     = rightCount ;
                    finalResults[boundaryPosition + 1] = leftCount ;
                } else {
                    finalResults[boundaryPosition]     = leftCount ;
                    finalResults[boundaryPosition + 1] = rightCount ;
                }
            }
            
            transitionCounter = 0 ;
            
            rightCount = 0 ;
            leftCount = 0 ;
        }
        
        if ( currentIdx === charSequence.length - 2 ) {
            leftCount += 1 ; // Add the last character
            
           if ( ( rightCount + leftCount ) % 2 === 0 ) {
                finalResults[boundaryPosition]     = ( rightCount + leftCount ) / 2 ;
                finalResults[boundaryPosition + 1] = ( rightCount + leftCount ) / 2 ;
            } else {
                if ( ( Math.max( rightCount, leftCount ) - 1 ) % 2 === 0 ) {
                    finalResults[boundaryPosition]     = rightCount ;
                    finalResults[boundaryPosition + 1] = leftCount ;
                } else {
                    finalResults[boundaryPosition]     = leftCount ;
                    finalResults[boundaryPosition + 1] = rightCount ;
                }
            } 
        }
    }
    
    console.log( finalResults.join(" ") );
}
processInput( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;