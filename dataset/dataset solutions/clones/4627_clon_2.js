const sourceContent=require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
; ( ( initialFeed ) => {
    const textSegments = initialFeed.split ( '\n' )
    const itemCount = +textSegments[0]
    const dataSequence = textSegments [ 1 ] . split ( ' ' ) . map ( Number )

    let outcomeOne = 0
    let runningSum = 0
    for(let indexPos = 0; indexPos < itemCount; indexPos++ ) {
        const isOddIndex = indexPos % 2
        if ( ! isOddIndex & runningSum + dataSequence[indexPos] > 0 ) {
            runningSum += dataSequence[indexPos]
        } else if ( isOddIndex & runningSum + dataSequence[indexPos] < 0 ) {
            runningSum += dataSequence[indexPos]
        } else {
            outcomeOne += Math.abs ( runningSum + dataSequence[indexPos] - ( isOddIndex ? -1 : 1 ) )
            runningSum = isOddIndex ? -1 : 1
        }
    }

    let outcomeTwo = 0
    runningSum = 0
    for ( let indexPos = 0 ; indexPos < itemCount ; indexPos ++ ) {
        const isOddIndex = ( indexPos + 1 ) % 2
        if ( ! isOddIndex & runningSum + dataSequence[indexPos] > 0 ) {
            runningSum += dataSequence[indexPos]
        } else if ( isOddIndex & runningSum + dataSequence[indexPos] < 0 ) {
            runningSum += dataSequence[indexPos]
        } else {
            outcomeTwo += Math.abs ( runningSum + dataSequence[indexPos] - ( isOddIndex ? -1 : 1 ) )
            runningSum = isOddIndex ? -1 : 1
        }
    }

    console.log ( Math.min ( outcomeOne , outcomeTwo ) )
} ) ( sourceContent )