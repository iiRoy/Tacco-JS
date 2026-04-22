const fileSystemUtility = require("node:fs");

const contentFetcher = fileSystemUtility.readFileSync;

const inputSource = "dev/stdinput";
const characterEncoding = "utf-8";

(function(programInput) {
    const stringSegments = programInput.split('\n') ;
    const totalElements = parseFloat(stringSegments[0]) ;
    const numberSequence = stringSegments[1].split(' ').map(parseFloat) ;

    let overallSumResult = 0 ;
    let currentStartingPosition = 0 ;

    while (currentStartingPosition < totalElements) {
        let cumulativeSumArray = [numberSequence[currentStartingPosition]] ;
        let cumulativeXorArray = [numberSequence[currentStartingPosition]] ;
        let validSubarrayCounter = 1 ;

        for ( let offsetIndex = 1 ; offsetIndex < totalElements ; offsetIndex++ ) {
            cumulativeSumArray[offsetIndex] = cumulativeSumArray[offsetIndex - 1] + numberSequence[offsetIndex + currentStartingPosition] ;
            cumulativeXorArray[offsetIndex] = cumulativeXorArray[offsetIndex - 1] ^ numberSequence[offsetIndex + currentStartingPosition] ;
            if (cumulativeSumArray[offsetIndex] === cumulativeXorArray[offsetIndex]) {
                validSubarrayCounter++ ;
            }
            else {
                break ;
            }
        }
        overallSumResult += validSubarrayCounter;
        currentStartingPosition++ ;
    }

    console.log(overallSumResult) ;

})(contentFetcher(inputSource, characterEncoding)) ;