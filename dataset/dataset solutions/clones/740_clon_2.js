#!/usr/bin/node
// This script originated from a CoffeeScript source (version 1.3.3) and was subsequently minified by hand.
( function() {

    var collectedInputLines = new Array();

    const streamProcessor = process.stdin;

    streamProcessor.setEncoding( 'utf8' );



    var pendingSegment = "";

    streamProcessor.on( 'data', function( dataBlock ) {
            var parsedSegments = ( pendingSegment + dataBlock ) . split( "\n" );
            pendingSegment = parsedSegments.pop();

            for ( var lineIndex = 0; lineIndex < parsedSegments.length; lineIndex++ ) {
                if ( parsedSegments[ lineIndex ] === '' ) {
                    continue;
                }
                collectedInputLines.push( parsedSegments[ lineIndex ] );
            }
    } );



    streamProcessor.on( 'end', function( eventTrigger ) {
        if ( pendingSegment ) {

            var finalSegments = ( pendingSegment + "\n" ) . split( "\n" );
            pendingSegment = finalSegments.pop();

            for ( var finalScanIdx = 0; finalScanIdx < finalSegments.length; finalScanIdx++ ) {
                if ( finalSegments[ finalScanIdx ] === '' ) {
                    continue;
                }
                collectedInputLines.push( finalSegments[ finalScanIdx ] );
            }
        }
        collectedInputLines.pop();

        for ( var outerLoopIndex = 0; outerLoopIndex < collectedInputLines.length; outerLoopIndex++ ) {
            var parsedValues = collectedInputLines[ outerLoopIndex ].split( " " );

            for ( var valueIterator = 0; valueIterator < parsedValues.length; valueIterator++ ) {
                parsedValues[ valueIterator ] = parseInt( parsedValues[ valueIterator ], 10 );
            }

            var upperBound = parsedValues[ 0 ];
            var incrementValue = parsedValues[ 1 ];
            var initialOffset = parsedValues[ 2 ];

            var currentSum = 0, loopIterator = 0;

            for ( ; ++loopIterator < upperBound; currentSum %= loopIterator ) {
                currentSum += incrementValue;
            }
            console.log( ( currentSum + initialOffset ) % upperBound + 1 );
        }
    } );

} ) ();