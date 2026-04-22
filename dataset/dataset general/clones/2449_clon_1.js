/*
 * This file contains the implementation for the BetterExamples library.
 * It provides enhanced code example functionality.
 */
// Original author and licensing information:
/**
 * @author Willem Mulder
 * @license CC-BYSA 3.0 Unported
 */


// jQuery document ready function to inject necessary styles into the DOM.
$( function ( ) {

    // Appends a style block to the body for custom CSS classes used by BetterExamples.
    $( "body" ).append( "<style> .betterExampleNoSetHeight { height: auto !important; } .betterExampleVisible { display: block !important; visibility: visible !important; } </style>" ) ;

} ) ;


// Global container for all BetterExample instances.
BetterExamples = {

    // Stores references to all active BetterExample instances, keyed by their unique IDs.
    instances : { } ,

    /**
     * Retrieves an existing BetterExample instance by its ID.
     * @param {string} id - The unique identifier of the instance.
     * @returns {BetterExample} The BetterExample instance, or undefined if not found.
     */
    getInstance : function ( id ) {
        return this.instances[ id ] ;
    }

} ; // End of BetterExamples object definition.


/**
 * Constructor function for a BetterExample instance.
 * @param {HTMLElement|jQuery} inputelm - The DOM element or jQuery object representing the input area.
 * @param {HTMLElement|jQuery} outputelm - The DOM element or jQuery object representing the output area.
 * @param {object} [options] - Configuration options for the instance.
 * @returns {object} The newly created or existing BetterExample facade.
 */
BetterExample = function ( inputelm , outputelm , options ) {

    // Initialize options, defaulting to an empty object if not provided.
    var options = options || { } ;

    // Generate a unique ID for this instance if not provided in options.
    var id = options.id || "instance_" + Math.floor( Math.random( ) * 100000000000 ) ;

    // Debugging flags and state variables.
    var inDebug = false ;
    var sleepingForDebug = false ; // Placeholder for potential future debug stepping logic.

    var textAreaLength = -1 ; // Tracks the length of the textarea content for change detection.
    var originalTextAreaContent = "" ; // Stores the initial content of the input textarea.


    var currentLine ; // Holds the current line number during execution/debugging.

    // Wrap the input element with jQuery for easier manipulation.
    var inputelm = $( inputelm ) ;

    // Check if an instance already exists for this input element.
    // If an existing instance is found, return it to prevent duplication.
    if ( inputelm.attr( "betterexamplesid" ) && BetterExamples.getInstance( inputelm.attr( "betterexamplesid" ) ) ) {

        return BetterExamples.getInstance( inputelm.attr( "betterexamplesid" ) ) ;

    }
    else {

        // If no existing instance, assign the new ID to the input element.
        inputelm.attr( "betterexamplesid" , id ) ;

    }

    // Wrap the output element with jQuery.
    var outputelm = $( outputelm ) ;

    // Create the inner textarea element for code input.
    // Includes inline styles for appearance and functionality.
    // The 'wrap="off"' attribute is specifically for IE compatibility.
    var inputInnerElm = $( "<textarea style='outline: none; z-index:10; position: relative; width: 100%; height: 95%; background: rgba(255,255,255,0); border: none; text-decoration: none; overflow-y: hidden; overflow-x: auto;' wrap='off'></textarea>" ) ;

    // Store the original HTML content of the input element before replacing it with the textarea.
    originalTextAreaContent = inputelm.html( ) ;

    // Set the initial content of the new textarea to the original content.
    inputInnerElm.html( originalTextAreaContent ) ;

    // Replace the input element's content with the newly created textarea.
    inputelm.html( inputInnerElm ) ;

    // Attach a keydown event listener to the input element to handle execution triggers.
    inputelm.on( "keydown" , function ( event ) {

        // Update the stored textarea content length.
        textAreaLength = inputelm.find( "textarea" ).val( ).length ;

        // Check for Control+R (event.which == "82" && event.ctrlKey) or F9 (event.which == "120").
        if ( ( event.which == "82" && event.ctrlKey ) || event.which == "120" ) {

            event.preventDefault( ) ; // Prevent default browser actions (e.g., page reload for F9).
            event.stopPropagation( ) ; // Stop event propagation.
            facade.run( ) ; // Execute the code via the facade.

        }

    } ) ; // End of keydown event handler.


    /**
     * Adjusts the height of the textarea to fit its scrollable content.
     * This prevents unnecessary scrollbars and improves user experience.
     */
    function fitToScrollHeight ( ) {

        // Only proceed if the content of the textarea has actually changed.
        if ( textAreaLength != inputelm.find( "textarea" ).val( ).length ) {

            var firstHeight = inputelm.find( "textarea" ).height( ) ; // Get current height.

            // Set the textarea height to its scrollHeight to fit all content.
            inputelm.find( "textarea" ).css( "height" , inputelm.find( "textarea" ).get( 0 ).scrollHeight + "px" ) ;

            // If the textarea expanded, scroll the parent element to the bottom.
            if ( inputelm.find( "textarea" ).height( ) > firstHeight ) {

                inputelm.parent( ).animate( {
                    scrollTop : inputelm.find( "textarea" ).height( )
                } , 0 ) ;

            }

        }

    } // End of fitToScrollHeight function.


    // Attach event listeners for keyup, focusin, and focusout to the input element.
    // These events trigger height adjustment and clear the output area.
    inputelm.on( "keyup focusin focusout" , function ( event ) {

        fitToScrollHeight( ) ; // Adjust height on content change or focus.
        facade.clearOutput( true ) ; // Clear output, possibly with a fade effect.

    } ) ; // End of keyup/focus events handler.


    // Array to store backups of original window functions (like alert, console.log).
    var functionBackups = [ ] ;


    // Temporary element for measuring line height.
    var checkelm = inputelm.find( "textarea" ) ;
    var inputText = checkelm.html( ) ; // Store current content.

    // Add a temporary class to ensure height is auto for measurement.
    checkelm.addClass( "betterExampleNoSetHeight" ) ;

    // Populate the textarea with multiple lines to accurately determine line height.
    // This is a workaround for browsers that might return 0 scrollHeight for single-line content.
    checkelm.html( "line 1\r\nline 2\r\nline 3\r\nline 4\r\nline 5\r\nline 6\r\nline 7\r\nline 8\r\nline 9\r\nline 10" ) ;

    // Calculate the average height of a single line.
    var inputLineHeight = checkelm.get( 0 ).scrollHeight / 10 ;

    // If inputLineHeight is 0 (e.g., if the element was initially hidden).
    if ( ! inputLineHeight ) {

        // Temporarily make the element and its parents visible to measure height.
        checkelm.parents( ).addClass( "betterExampleVisible" ) ;

        // Recalculate line height after making elements visible.
        inputLineHeight = checkelm.get( 0 ).scrollHeight / 10 ;

        checkelm.html( inputText ) ; // Restore original content.
        fitToScrollHeight( ) ; // Adjust height based on restored content.

        // Hide elements again.
        checkelm.parents( ).removeClass( "betterExampleVisible" ) ;

    }
    else {

        checkelm.html( inputText ) ; // Restore original content if already visible.

    }

    // Remove the temporary height class.
    checkelm.removeClass( "betterExampleNoSetHeight" ) ;


    // Final adjustment of the textarea height to fit its actual content.
    inputelm.find( "textarea" ).css( "height" , inputelm.find( "textarea" ).get( 0 ).scrollHeight + "px" ) ;


    /**
     * Recursively visits nodes in an AST (Abstract Syntax Tree).
     * @param {object} node - The current AST node to visit.
     * @param {function} [visitFunction] - An optional function to execute for each node.
     * @param {Array<object>} [parentsList] - A list of parent nodes, used for tracking the path.
     */
    function visit ( node , visitFunction , parentsList ) {

        // Initialize parents list, defaulting to an empty array if not provided.
        var parents = ( typeof parentsList === 'undefined' ) ? [ ] : parentsList ;

        visitFunction = visitFunction || false ; // Ensure visitFunction is callable or false.

        // If a visit function is provided and it returns false, stop traversing this branch.
        if ( visitFunction && visitFunction( node , parentsList ) == false ) {
            return ;
        }

        // Iterate over properties of the current node.
        for ( key in node ) {

            // Ensure the property is directly on the node (not inherited).
            if ( node.hasOwnProperty( key ) ) {

                child = node[ key ] ; // Get the child node/property.

                path = [ node ] ; // Start a new path for the child.
                path.push( parents ) ; // Add current parents to the child's path.

                // If the child is an object and not null, recursively visit it.
                if ( typeof child === 'object' && child !== null ) {
                    visit( child , visitFunction , path ) ;
                }

            }

        }

    } ; // End of visit function.


    /**
     * Restores original window functions that were overridden for execution.
     */
    function restoreFunctions ( ) {

        // Loop through the stored function backups.
        for ( functionID in functionBackups ) {

            // Restore the window function to its original state.
            window[ functionID ] = functionBackups[ functionID ] ;

            // Special handling for console.log, as it's often a property of 'console' not 'window'.
            if ( functionID == "console.log" ) {
                // TODO: Make this part more generic to handle other nested objects if needed.
                console.log = functionBackups[ functionID ] ;
            }

        }

    } // End of restoreFunctions function.


    /**
     * Positions and resizes error messages in the output area to prevent overlap.
     * Messages are constrained by the space available until the next message.
     */
    function positionMessages ( ) {

        // Iterate over each message element in the output area.
        outputelm.find( ".betterExamplesLine" ).each( function ( ) {

            var currentLineNumber = $( this ).attr( "line" ) ; // Get the line number of the current message.
            var lowestNextLineNumber = -1 ; // Initialize to -1, indicating no next message found yet.

            // Find the closest subsequent message.
            $( this ).siblings( ".betterExamplesLine" ).each( function ( ) {

                if ( $( this ).attr( "line" ) > currentLineNumber && ( lowestNextLineNumber == -1 || lowestNextLineNumber > $( this ).attr( "line" ) ) ) {
                    lowestNextLineNumber = $( this ).attr( "line" ) ; // Update with the lowest next line number.
                }

            } ) ;

            // If a subsequent message was found.
            if ( lowestNextLineNumber != -1 ) {

                var space = lowestNextLineNumber - $( this ).attr( "line" ) ; // Calculate available space in lines.

                $( this ).css( "height" , "auto" ) ; // Allow element to determine its natural height first.

                // If the natural height exceeds the available space, restrict it.
                if ( $( this ).height( ) > ( space * inputLineHeight ) ) {
                    $( this ).css( "height" , ( space * inputLineHeight ) + "px" ) ;
                }

            }
            else {

                $( this ).css( "height" , "auto" ) ; // No subsequent message, unlimited vertical space.

            }

        } ) ;

    } // End of positionMessages function.


    /**
     * Draws a debug bar (highlight) on the current line in both input and output areas.
     */
    function drawDebugBar ( ) {

        // Find existing debug bars in input and output elements.
        ielm = inputelm.find( ".betterExamplesDebugBar" ).first( ) ;
        oelm = outputelm.find( ".betterExamplesDebugBar" ).first( ) ;

        var line = currentLine ; // The line number to highlight.

        if ( ielm.length == 0 ) {

            // If no debug bar exists, create new ones.
            var start = "<div class='betterExamplesDebugBar' line='" + line + "' style='background: #ffa; position:absolute; left: 0px; top:" + ( inputLineHeight * ( line - 1 ) ) + "px; height: " + inputLineHeight + "px; display: block; width: 100%; z-index: 2; overflow: hidden;'>" ;
            var end = "</div>" ;

            outputelm.append( start + "&nbsp;" + end ) ; // Append to output element.
            inputelm.prepend( start + "&nbsp;" + end ) ; // Prepend to input element.

        }
        else {

            // If debug bars already exist, update their line number and position.
            ielm.add( oelm ).attr( "line" , line ) ;
            ielm.add( oelm ).css( "top" , ( inputLineHeight * ( line - 1 ) ) + "px" ) ;

        }

    } // End of drawDebugBar function.


    /**
     * Removes any active debug bars from the input and output areas.
     */
    function removeDebugBar ( ) {

        outputelm.find( ".betterExamplesDebugBar" ).remove( ) ; // Remove from output.
        inputelm.find( ".betterExamplesDebugBar" ).remove( ) ; // Remove from input.

    } // End of removeDebugBar function.


    // The public interface (facade) for the BetterExample instance.
    var facade = {

        /**
         * Initiates debug mode and runs the code.
         */
        "debug" : function ( ) {

            inDebug = true ; // Set debug flag to true.
            this.run( ) ; // Execute the code.
            inDebug = false ; // Reset debug flag after execution.
            removeDebugBar( ) ; // Clean up debug bars.

        } , // End of debug method.

        /**
         * Executes the code present in the input textarea.
         * Includes error handling, function redirection, and line-by-line execution tracking.
         */
        "run" : function ( ) {

            // Reset current line pointer to the beginning.
            currentLine = 1 ;

            // === Begin function redirection setup ===

            var instance = this ; // Store reference to the facade for use within nested functions.

            // Backup original alert and redirect it to the facade's log method.
            functionBackups[ "alert" ] = window.alert ;
            window.alert = function ( output ) {
                instance.log( output ) ;
            } ;

            // Backup original console.log and redirect it to the new alert function (which logs via facade).
            if ( typeof( console ) != "undefined" && typeof( console.log ) != "undefined" ) {
                functionBackups[ "console.log" ] = console.log ;
                console.log = alert ;
            }

            // Backup original window.onerror and set up custom error handling.
            functionBackups[ "onerror" ] = window.onerror ;
            window.onerror = function ( message , url , lineNo ) {

                var lineIndex = message.indexOf( "Line" ) ;

                if ( lineIndex > -1 ) {
                    // This indicates a syntax error, typically reported with "Line X".
                    var until = message.indexOf( ":" , lineIndex ) ;
                    currentLine = message.slice( lineIndex + 4 , until ) ; // Extract line number.
                    message = message.slice( until + 2 ) ; // Get the actual error message part.

                }
                else {
                    // This is a runtime error.
                    if ( message.indexOf( "Uncaught" ) === 0 ) {
                        message = message.slice( message.indexOf( ":" , 8 ) + 2 ) ; // Clean up "Uncaught Error: " prefix.
                    }
                    // Display at current line, or alternatively use lineNo for more precision if available.
                    // Alternatively get from function: currentLine = lineNo;
                }

                // Conditional checks for browser-specific error message formats (commented out in original).
                // Firefox : if (message.indexOf("Line") === 0) {
                // Webkit : if (message.indexOf("Uncaught Error: Line") === 0) {
                // Opera : if (message.indexOf("Uncaught exception: Error: Line") === 0) {

                if ( lineIndex == -1 ) {
                    facade.log( message , "Runtime error" ) ; // Log as runtime error.
                    // Restore functions and position messages. A runtime error stops execution,
                    // so no further messages will be generated.
                    restoreFunctions( ) ;
                    positionMessages( ) ;
                }
                else {
                    facade.log( message , "Syntax error" ) ; // Log as syntax error.
                }

                return true ; // Indicate that the error was handled.

            } ; // End of window.onerror handler.

            // === End function redirection setup ===


            // Clear any previous output.
            this.clearOutput( ) ;

            //==
            // Run the input code, insert line-pointers for tracking, and render output.
            //==

            var input = inputelm.find( "textarea" ).val( ) ; // Get the code from the textarea.

            // Parse the input code to build an Abstract Syntax Tree (AST) using Esprima.
            var analysis = esprima.parse( input , { range : true , loc : true } ) ;
            var locations = [ ] ; // Array to store locations where pointers should be inserted.

            // Traverse the AST to identify statements where line pointers should be inserted.
            visit( analysis , function ( node , parentsList ) {

                // We are interested in ForStatement, VariableDeclaration, or ExpressionStatement types.
                if ( node.type === "ForStatement" || node.type === "VariableDeclaration" || node.type === "ExpressionStatement" ) {

                    // Exclude certain situations where adding pointers would break the code:
                    // 1. Immediately after {}-less if statements (the pointer would become the 'then' block).
                    // 2. Within a for() construct's initializer, condition, or update parts.
                    if ( node.type === "VariableDeclaration" && parentsList.length && parentsList[ 0 ].type == "ForStatement" ) {
                        // Variable declaration within a for-loop's declaration part. Avoid adding functions here.
                    }
                    else {
                        locations.push( { range : node.range , location : node.loc } ) ;
                    }

                    // TODO: Consider adding a log at the end of a FOR statement.
                    // This could help in cases where an error in the increment-operation
                    // might show on the wrong line.
                    // Example: for(x=1;x<10;x+=unknown) { ... } // Error on wrong line.

                }

            } ) ; // End of AST visit function.

            // Insert the line pointer function calls at the identified locations in the code.
            var charactersInserted = 0 ; // Keep track of characters inserted to adjust ranges.

            for ( locationId in locations ) {

                var range = locations[ locationId ].range ; // Character range of the statement.
                var location = locations[ locationId ].location ; // Line/column location.

                // The function call to insert.
                var func = "BetterExamples.getInstance('" + id + "').enterStep(" + location.start.line + ");" ;
                var length = func.length ; // Length of the inserted string.

                // Split the input string and insert the function call.
                var firstPart = input.slice( 0 , range[ 0 ] + charactersInserted ) ;
                var secondPart = input.slice( range[ 0 ] + charactersInserted ) ;
                input = firstPart + func + secondPart ;

                charactersInserted += length ; // Update the total characters inserted.

            }

            // Execute the modified input code.
            eval( input ) ;

            // If a runtime error occurred, we would not reach this point,
            // as window.onerror would have handled it.
            // If we reach here, execution completed (or a syntax error was caught earlier).
            restoreFunctions( ) ; // Restore original window functions.
            positionMessages( ) ; // Position any generated output messages.

        } , // End of run method.

        /**
         * Restores the input textarea content to its initial state.
         */
        "restoreCode" : function ( ) {

            this.clear( ) ; // Clear current content and output.
            inputelm.find( "textarea" ).val( originalTextAreaContent ) ; // Set original content.

        } , // End of restoreCode method.

        /**
         * Sets the content of the input textarea to a specified code string.
         * @param {string} code - The new code string to display.
         */
        "setCode" : function ( code ) {

            this.clear( ) ; // Clear current content and output.
            inputelm.find( "textarea" ).val( code ) ; // Set new code.

            // Use a short timeout to ensure DOM updates before calculating scroll height.
            setTimeout( function ( ) {
                fitToScrollHeight( ) ; // Adjust textarea height.
            } , 1 ) ;

        } , // End of setCode method.

        /**
         * Clears both the input textarea and the output area.
         */
        "clear" : function ( ) {

            inputelm.find( "textarea" ).val( "" ) ; // Clear textarea content.
            this.clearOutput( ) ; // Clear output area.

        } , // End of clear method.

        /**
         * Clears the output area, with an optional fade effect.
         * @param {boolean} [withFade] - If true, output elements will fade out before removal.
         */
        "clearOutput" : function ( withFade ) {

            if ( withFade ) {

                // Fade out and remove messages from input and output.
                inputelm.find( ".betterExamplesLine" ).fadeOut( function ( ) { inputelm.find( ".betterExamplesLine" ).remove( ) ; } ) ;
                outputelm.find( "*" ).fadeOut( function ( ) { outputelm.html( "" ) ; } ) ;

                // If outputelm is empty after fadeOut, ensure its HTML is cleared.
                if ( outputelm.find( "*" ).size( ) == 0 ) {
                    outputelm.html( "" ) ;
                }

            }
            else {

                inputelm.find( ".betterExamplesLine" ).remove( ) ; // Remove messages from input immediately.
                outputelm.html( "" ) ; // Clear output HTML immediately.

            }

        } , // End of clearOutput method.

        /**
         * Logs an object to the output area, formatting it based on its type.
         * @param {*} obj - The object to log.
         * @param {string} [type] - Optional type string (e.g., "Error", "String").
         */
        "log" : function ( obj , type ) {

            var type = type || typeof( obj ) ; // Determine type, default to typeof result.
            type = type.charAt( 0 ).toUpperCase( ) + type.slice( 1 ) ; // Capitalize the first character.

            var extraStyle = "" ; // Additional CSS style for the log entry.

            // Apply specific styling for error messages.
            if ( type.indexOf( "error" ) > -1 ) { extraStyle = "background: #CC1919; color: #fff;" }

            var line = currentLine ; // The line number associated with this log.

            // Function to generate the starting HTML for a log line, including positioning and hover effects.
            var start = function ( zindex ) {
                return "<div class='betterExamplesLine' line='" + line + "' style='background: #eef; position:absolute; left: 0px; top:" + ( inputLineHeight * ( line - 1 ) ) + "px; height: " + inputLineHeight + "px; display: block; width: 100%; z-index: " + zindex + "; overflow: hidden;' onMouseOver='$(this).attr(\"backupZindex\",$(this).css(\"z-index\")); $(this).attr(\"backupHeight\",$(this).css(\"height\")); $(this).css(\"height\",\"auto\").css(\"z-index\",\"100\")' onMouseOut='$(this).css(\"height\",$(this).attr(\"backupHeight\")).css(\"z-index\",$(this).attr(\"backupZindex\"))'>" ;
            } ;

            // Build the output content, starting with a type label.
            var output = "<div style='width: 130px; background: #dde; " + extraStyle + " display: inline-block; z-index: 3;'>" + type + "</div> " ;

            if ( obj instanceof Function ) {

                var func = obj.toString( ) ; // Get the function's source code.

                // Remove any inserted pointer-calls from the function string for cleaner display.
                func = func.replace( /BetterExamples\.getInstance\([^\)]+\)\.enterStep\([0-9]+\)+\;/ig , "" ) ;
                output += func ;

            }
            else {

                output += JSON.stringify( obj , null , 4 ) ; // Stringify other objects for display.

            }

            var end = "</div>" ; // Closing div tag.

            // Append the log entry to the output element and prepend a corresponding marker to the input element.
            outputelm.append( start( 3 ) + output + end ) ;
            inputelm.prepend( start( 1 ) + "&nbsp;" + end ) ;

        } , // End of log method.

        /**
         * Returns the unique ID of this BetterExample instance.
         * @returns {string} The instance ID.
         */
        "getId" : function ( ) {
            return id ;
        } , // End of getId method.

        /**
         * Sets a new unique ID for this BetterExample instance.
         * Updates the global BetterExamples.instances mapping.
         * @param {string} newId - The new ID to assign.
         */
        "setId" : function ( newId ) {

            delete BetterExamples.instances[ id ] ; // Remove old ID mapping.
            id = newId ; // Update instance ID.
            BetterExamples.instances[ id ] = facade ; // Register with new ID.

        } , // End of setId method.

        /**
         * Called when the execution steps through a line of code.
         * Handles debugging interaction if in debug mode.
         * @param {number} lineNumber - The current line number being executed.
         */
        "enterStep" : function ( lineNumber ) {

            currentLine = lineNumber ; // Update the current line number.

            // If debugging is active, pause execution and wait for user interaction.
            if ( inDebug ) {

                drawDebugBar( ) ; // Highlight the current line.

                // sleepingForDebug = true; // Potentially useful for while loops, not currently used.

                // Open a modal dialog to pause execution and get user input for stepping.
                var returnValue = window.showModalDialog( "js/debug.html" , null , "dialogleft:0;dialogtop:0;dialogheight:20;dialogwidth:200" ) ;

                if ( returnValue == "nextStep" ) {
                    // User chose to continue to the next step.
                    // Execution will resume.
                }
                else if ( returnValue == "exitDebug" ) {
                    // User chose to exit debug mode.
                    inDebug = false ;
                    removeDebugBar( ) ; // Clear debug bar.
                    // Execution will resume without stepping.
                }
                else {
                    // Any other return value or dialog closure means exiting debug.
                    inDebug = false ; // Prevent re-opening the dialog continuously.
                    removeDebugBar( ) ; // Clear debug bar.
                    // Execution will resume without stepping.
                }

            }

        } , // End of enterStep method.

        /**
         * Unused function, potentially for future debug control.
         */
        "goToNextStep" : function ( ) {
            // sleepingForDebug = false; // Placeholder for future debug stepping logic.
        }

    } ; // End of facade object.

    // Register this instance with the global BetterExamples collection.
    BetterExamples.instances[ id ] = facade ;

    return facade ; // Return the public interface.

} ; // End of BetterExample constructor function.