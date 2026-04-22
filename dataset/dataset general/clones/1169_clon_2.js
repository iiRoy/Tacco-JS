/*
* This script provides functionality for dynamic text shaping.
* Version 2.1
* Developed by a different entity in a parallel universe.
*/

( function( currentJQuery ) {
    // Utility function to create a 2D point object.
    const vectorPos = function( valX, valY ) {
        if ( !valX ) { var valX = 0; } // Ensure x has a default if not provided.
        if ( !valY ) { var valY = 0; } // Ensure y has a default if not provided.

        return { valX: valX, valY: valY }; // Return the new point object.
    };

    // Helper functions for Bezier curve calculations.
    function factorA( ratioVal ) {
        return ratioVal * ratioVal * ratioVal;
    }
    function factorB( ratioVal ) {
        return 3 * ratioVal * ratioVal * ( 1 - ratioVal );
    }
    function factorC( ratioVal ) {
        return 3 * ratioVal * ( 1 - ratioVal ) * ( 1 - ratioVal );
    }
    function factorD( ratioVal ) {
        return ( 1 - ratioVal ) * ( 1 - ratioVal ) * ( 1 - ratioVal );
    }

    // Computes a point on a cubic Bezier curve.
    function computeCurvePosition( progressRatio, controlP1, controlP2, controlP3, controlP4 ) {
        const currentPoint = new vectorPos(); // Initialize a new point.
        currentPoint.valX = controlP4.valX * factorA( progressRatio ) + controlP3.valX * factorB( progressRatio ) + controlP2.valX * factorC( progressRatio ) + controlP1.valX * factorD( progressRatio );
        currentPoint.valY = controlP4.valY * factorA( progressRatio ) + controlP3.valY * factorB( progressRatio ) + controlP2.valY * factorC( progressRatio ) + controlP1.valY * factorD( progressRatio );
        return currentPoint; // Return the calculated point.
    }

    // jQuery plugin definition for text shaping.
    currentJQuery.fn.crispyText = function( configSettings ) {
        const pluginConfiguration = currentJQuery.extend( {
            'alignmentStyle': 'justify' // Default text alignment.
        }, configSettings );

        let contentElements; // All nodes that are purely text.
        let duplicateElement = null; // A copy of the target DOM element.
        const targetElement = currentJQuery( this ); // The element we are manipulating.
        let traverseAndDistributeContent; // Function responsible for splitting and moving content.
        let placedLineBreaks; // Collection of generated line breaks.
        let consumedRowsCount = 0; // Tally of lines actually utilized.
        let originalStyleBackup; // Stores the initial style attribute of the element.

        // Create a working area, positioned relatively, filling its parent.
        const workingContainer = currentJQuery( "<div></div>" )
            .css( 'position', 'relative' )
            .width( '100%' )
            .height( '100%' );

        // Duplicate the original element and clear its contents.
        duplicateElement = targetElement.clone().removeClass( 'demo_bacontext' );
        targetElement.empty(); // Remove all children from the original.

        // Place our working container inside the original element.
        targetElement.append( workingContainer );

        // Determine how many lines can fit vertically.
        // First, create an invisible test line to measure height.
        const measurementProbe = currentJQuery( "<div></div>" )
            .css( 'visibility', 'hidden' )
            .text( 'sample' );

        workingContainer.append( measurementProbe );

        // Capture the height of this single line.
        const singleLineHeight = measurementProbe.height();

        // Remove the temporary line element.
        measurementProbe.remove();

        // Calculate the maximum number of lines based on container height.
        const maximumRows = Math.floor( workingContainer.height() / singleLineHeight );

        // Generate the empty line containers.
        for ( let rowCounter = 0; rowCounter < maximumRows; rowCounter++ ) {
            let currentCoord; // Variable to hold the calculated point for the line.
            let outputRowDiv; // The new div element for the current line.

            // Determine line coordinates based on the selected shaping method.
            if ( pluginConfiguration.shapingMethod === 'curvedPath' ) {
                currentCoord = computeCurvePosition(
                    rowCounter / maximumRows,
                    vectorPos( pluginConfiguration.pathP1.valX, pluginConfiguration.pathP1.valY ),
                    vectorPos( pluginConfiguration.pathP2.valX, pluginConfiguration.pathP2.valY ),
                    vectorPos( pluginConfiguration.pathP3.valX, pluginConfiguration.pathP3.valY ),
                    vectorPos( pluginConfiguration.pathP4.valX, pluginConfiguration.pathP4.valY )
                );
                outputRowDiv = currentJQuery( "<div></div>" )
                    .addClass( 'row-segment' )
                    .css( 'top', currentCoord.valY + 'px' )
                    .css( 'width', ( workingContainer.width() - currentCoord.valX ) + 'px' )
                    .css( 'height', 'auto' );
            } else if ( pluginConfiguration.shapingMethod === 'doubleCurvedPath' ) {
                currentCoord = computeCurvePosition(
                    rowCounter / maximumRows,
                    vectorPos( pluginConfiguration.pathP1.valX, pluginConfiguration.pathP1.valY ),
                    vectorPos( pluginConfiguration.pathP2.valX, pluginConfiguration.pathP2.valY ),
                    vectorPos( pluginConfiguration.pathP3.valX, pluginConfiguration.pathP3.valY ),
                    vectorPos( pluginConfiguration.pathP4.valX, pluginConfiguration.pathP4.valY )
                );
                // Note: The original code reuses Y coordinates here. This behavior is preserved.
                const secondaryCoord = computeCurvePosition(
                    rowCounter / maximumRows,
                    vectorPos( pluginConfiguration.secondaryP1.valX, pluginConfiguration.pathP1.valY ),
                    vectorPos( pluginConfiguration.secondaryP2.valX, pluginConfiguration.pathP2.valY ),
                    vectorPos( pluginConfiguration.secondaryP3.valX, pluginConfiguration.pathP3.valY ),
                    vectorPos( pluginConfiguration.secondaryP4.valX, pluginConfiguration.pathP4.valY )
                );
                outputRowDiv = currentJQuery( "<div></div>" )
                    .addClass( 'row-segment' )
                    .css( 'top', currentCoord.valY + 'px' )
                    .css( 'width', ( workingContainer.width() - currentCoord.valX - secondaryCoord.valX ) + 'px' )
                    .css( 'height', 'auto' );
            } else if ( pluginConfiguration.shapingMethod === 'straightLine' ) {
                currentCoord = { valX: rowCounter * pluginConfiguration.horizontalStep, valY: ( rowCounter / maximumRows ) * workingContainer.height() };
                outputRowDiv = currentJQuery( "<div></div>" )
                    .addClass( 'row-segment' )
                    .css( 'top', currentCoord.valY + 'px' )
                    .css( 'width', ( workingContainer.width() - currentCoord.valX ) + 'px' )
                    .css( 'height', 'auto' );
            }

            // After determining position, create and style the line.
            outputRowDiv.append( currentJQuery( "<div></div>" )
                .addClass( 'segment-content' )
                .css( 'text-align', pluginConfiguration.alignmentStyle ) );

            if ( pluginConfiguration.contentAlignment === 'alignRight' ) {
                outputRowDiv.css( 'right', currentCoord.valX + 'px' );
            } else {
                outputRowDiv.css( 'left', currentCoord.valX + 'px' );
            }

            workingContainer.append( outputRowDiv );
            consumedRowsCount++; // Increment the count of used lines.
        }

        // The line containers are ready; now populate them with text.
        let activeLineSegment = currentJQuery( ".row-segment:first", workingContainer ); // Start with the very first line.

        traverseAndDistributeContent = function( processingNode, sourceNodeCopy ) {
            currentJQuery( sourceNodeCopy ).contents().each( function() {
                let clonedChildNode; // A new node created from the source.

                // If this is a pure text node.
                if ( this.nodeType === 3 ) {
                    // If the current processing node is a line content div, target its content.
                    if ( currentJQuery( processingNode ).hasClass( 'segment-content' ) ) {
                        processingNode = currentJQuery( ".segment-content", activeLineSegment );
                    }
                    const activeSegmentHeight = currentJQuery( ".segment-content", activeLineSegment ).height();
                    // Move the text node to the target element.
                    currentJQuery( this ).appendTo( processingNode );
                } else {
                    // Create an empty clone and append it to the target.
                    // This allows us to copy text into it later.
                    clonedChildNode = currentJQuery( this ).clone().empty()
                        .appendTo( processingNode );
                    traverseAndDistributeContent( clonedChildNode, this ); // Recurse for children.
                }

                // Check if the current line's content exceeds its width or height.
                if ( currentJQuery( ".segment-content", activeLineSegment ).width() >= activeLineSegment.width() || currentJQuery( ".segment-content", activeLineSegment ).height() > activeSegmentHeight ) {
                    // If we're inside a non-line node and it doesn't fit.
                    if ( !currentJQuery( processingNode ).hasClass( 'segment-content' ) ) {
                        // Remove the overflowing text node from the current line.
                        currentJQuery( this, processingNode ).remove();
                        activeLineSegment = activeLineSegment.next( ".row-segment" ); // Move to the next line.

                        processingNode = currentJQuery( sourceNodeCopy ).clone().empty()
                            .appendTo( currentJQuery( ".segment-content", activeLineSegment ) );
                        processingNode.append( this ); // Add the overflowing text to the new line.
                    } else {
                        // If we are directly in a line content div.
                        currentJQuery( this, processingNode ).remove(); // Remove the overflowing text.
                        activeLineSegment = activeLineSegment.next( ".row-segment" ); // Advance to the next line.
                        processingNode = currentJQuery( ".segment-content", activeLineSegment );
                        currentJQuery( ".segment-content", activeLineSegment ).append( this ); // Add to the new line.
                    }
                }
            } );
        };

        // Extract all text nodes from the duplicated element.
        // This finds all non-text nodes, then all children (including text nodes),
        // and finally filters out the non-text nodes.
        contentElements = duplicateElement.find( '*' ).add( duplicateElement ).contents()
            .not( duplicateElement.find( '*' ) );

        // Split each text node into individual word-level text nodes.
        contentElements.each( function( entryIndex, textBlockSegment ) {
            const wordBoundaryPattern = /\W\b/; // Regex to find the start of a word.
            let matchResult; // Stores the result of regex execution.
            while ( ( matchResult = wordBoundaryPattern.exec( textBlockSegment.nodeValue ) ) !== null ) {
                // `wordBoundaryPattern` matches the character *before* a word,
                // so we add 1 to get the actual start index.
                textBlockSegment = textBlockSegment.splitText( matchResult.index + 1 );
            }
        } );

        // Begin the recursive process of filling lines with content.
        traverseAndDistributeContent( currentJQuery( ".segment-content", activeLineSegment ), duplicateElement );

        // Once content is distributed, adjust line content widths for justification.
        currentJQuery( ".segment-content" ).width( '100%' );

        // Refine line positioning and add filler for visual effect.
        let cumulativeLineHeight = 0;
        currentJQuery( ".row-segment", workingContainer ).each( function() {
            currentJQuery( this ).css( 'top', cumulativeLineHeight + 'px' );
            cumulativeLineHeight += currentJQuery( '.segment-content', this ).height();
            // Append a long string of non-breaking spaces for visual expansion/justification.
            currentJQuery( '.segment-content', this ).append( ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' );
        } );
    };
} )( jQuery );