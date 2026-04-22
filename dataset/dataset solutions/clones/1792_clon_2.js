const processInputData = ( rawInputText ) => {
    // This function takes raw text input and performs a comparison logic.

    const   firstEntityStartPos     =   Number( rawInputText.split('\n')[0].split(' ')[0] )
    ;
    const   firstEntitySpeed        =   Number( rawInputText.split('\n')[0].split(' ')[1] )
    ;

    const   secondEntityStartPos    =   Number( rawInputText.split('\n')[1].split(' ')[0] )
    ;
    const   secondEntitySpeed       =   Number( rawInputText.split('\n')[1].split(' ')[1] )
    ;

    const   maximumIterationTime    =   Number( rawInputText.split('\n')[2] )
    ;

    let     currentRelativeDistance =   0
    ;

    // Calculate the absolute initial distance between the two entities.
    if  ( firstEntityStartPos > secondEntityStartPos )
    {
        currentRelativeDistance = firstEntityStartPos - secondEntityStartPos
        ;
    }
    else
    {
        currentRelativeDistance = secondEntityStartPos - firstEntityStartPos
        ;
    }
    
    // Determine the rate at which the distance between them changes.
    const   distanceReductionPerUnitTime    =   firstEntitySpeed - secondEntitySpeed
    ;
    
    // Iterate through time steps to see if the distance closes.
    for ( let timeStepCount = 0; timeStepCount <= maximumIterationTime; timeStepCount++ )
    {
        if ( timeStepCount !== 0 )
        {
            currentRelativeDistance -= distanceReductionPerUnitTime
            ;
        }
        if ( currentRelativeDistance <= 0 ) // If distance is 0 or less, they've met or passed.
        {
            break
            ;
        }
    }
    
    // Output the result based on whether the distance was closed.
    if ( currentRelativeDistance <= 0 )
    {
        console.log("YES")
        ;
    }
    else
    {
        console.log("NO")
        ;
    }
}

// Invoke the main processing function with data from standard input.
processInputData ( require("fs").readFileSync("/dev/stdin", "utf8") )
;