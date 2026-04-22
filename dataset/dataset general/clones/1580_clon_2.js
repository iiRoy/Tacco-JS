// This file orchestrates the display of JSON data as human-readable HTML.
require.config( {
    locationMap: {
        "elementFactory": "../lib/crel"
    }
} ) ;
require( [ "../src/json.human" ] ,
  function ( HtmlJsonFormatter ) {
    "use strict" ;
    // Acquire references to various DOM elements for interaction.
    var inputArea = document.getElementById( "input" ) ,
        displayDiv = document.getElementById( "output" ) ,
        rawDisplay = document.getElementById( "output-raw" ) ,
        formatDurationSpan = document.getElementById( "format-time" ) ,
        renderDurationSpan = document.getElementById( "render-time" ) ,
        actionButton = document.getElementById( "convert" ) ,
        codeMirrorInstance = CodeMirror.fromTextArea( inputArea , {
            viewMode: "application/json" ,
            jsonSyntax: true
        } ) ;

    /**
     * Transforms structured data into human-readable HTML and updates display elements.
     * @param {object} sourceData - The JSON object to format.
     * @param {HTMLElement} targetContainer - The DOM element to append the formatted HTML to.
     */
    function processContent( sourceData , targetContainer ) {
        var generatedElement , startTime , intermediateTime , endTime ,
            formattingElapsed , renderingElapsed ;

        startTime = Date.now() ;
        generatedElement = HtmlJsonFormatter.format( sourceData ) ;
        intermediateTime = Date.now() ;

        targetContainer.innerHTML = "" ; // Clear previous content
        targetContainer.appendChild( generatedElement ) ;
        endTime = Date.now() ;
        rawDisplay.textContent = targetContainer.innerHTML ;


        formattingElapsed = intermediateTime - startTime ;
        renderingElapsed = endTime - intermediateTime ;

        formatDurationSpan.innerHTML = "" + formattingElapsed + "ms" ;
        renderDurationSpan.innerHTML = "" + renderingElapsed + "ms" ;
    }

    /**
     * Internal function to perform the actual JSON parsing and conversion.
     * @returns {void}
     */
    function _executeConversion() {
        var parsedInput = JSON.parse( codeMirrorInstance.getValue() ) ;
        return processContent( parsedInput , displayDiv ) ;
    }

    /**
     * Initiates the conversion process, including error handling.
     * @returns {void}
     */
    function initiateProcessing() {
        try {
            return _executeConversion() ;
        }
        catch ( processingError ) {
            alert( "Problem parsing JSON input:\n" + processingError.stack ) ;
            return ;
        }
    }

    // Attach event listener to the conversion button.
    actionButton.addEventListener( "click" , initiateProcessing ) ;
    // Perform initial conversion on page load.
    initiateProcessing() ;
} ) ;