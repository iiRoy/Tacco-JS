var    accumulatedInput =   "";
    var dataInputSource   = process . stdin;

    dataInputSource . resume (   )   ;
    dataInputSource . setEncoding (  "utf8" )  ;

    dataInputSource.on ('data',
        function ( inputChunk ) {
            accumulatedInput +=   inputChunk;
        }
    ) ;

    dataInputSource.on ('end',
        function (   )
        {
            var numericalDataPoints = accumulatedInput . split ( " " ) . map ( Number ) ;
            var finalDistance = Math.sqrt ( Math.pow ( numericalDataPoints [ 0 ] - numericalDataPoints [ 2 ], 2 ) + Math.pow ( numericalDataPoints [ 1 ] - numericalDataPoints [ 3 ], 2 ) ) ;
            console.log ( finalDistance ) ;
        }
    ) ;