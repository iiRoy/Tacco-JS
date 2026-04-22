jQuery( function( $ ) {

    // Main content area for the editor
    var textarea = $( 'textarea#content' );

    // CodeMirror editor configuration object
    var options = {
        onChange: function ( cm ) {
            // Update the hidden textarea with the CodeMirror content
            textarea.val( cm.getValue() );

            // Trigger a refresh of the markdown preview
            RotorMD.preview.update();
        }

        ,mode: 'markdown' // Set the editor's syntax highlighting mode
        ,matchBrackets: true // Enable bracket matching for easier code navigation
        ,lineWrapping: true // Allow lines to wrap if they exceed editor width
        ,indentWithTabs: true // Use tab characters for indentation
    };

    // Initialize CodeMirror on the textarea element
    var syntaxhinter = CodeMirror.fromTextArea( textarea.get( 0 ) // Pass the raw DOM element
                                                , options // Apply the defined options
                                               );

    // Initialize the RotorMD preview and resizer functionalities
    RotorMD.preview.init();
    RotorMD.resizer.init();

} ); // End of jQuery document ready function

// Main application object for RotorMD functionalities
var RotorMD = {

    preview: {

        frame: null, // Will hold the document object of the preview iframe

        init: function() {
            // Embed an iframe for the markdown preview
            jQuery( '#rme-preview' ).html( '<iframe id="rme-preview-content" src="about:blank"></iframe>' );

            // Get a reference to the iframe's document object
            RotorMD.preview.frame = jQuery( '#rme-preview-content' ).get( 0 ).contentWindow.document;

            // Construct HTML for custom CSS links
            var cssHTML = '';
            jQuery.each( RotorMD.localize.customCSS, function( index, url ) {
                cssHTML += '<link href="' + url + '" rel="stylesheet" type="text/css" />';
            } );

            // Write the initial HTML structure into the iframe, including CSS
            RotorMD.preview.frame.open();
            RotorMD.preview.frame.write( '<html><head>' + cssHTML + '</head><body class="mceContentBody"></body></html>' );
            RotorMD.preview.frame.close();

            // Forward mouse events from the iframe to the main document for consistent behavior
            jQuery( RotorMD.preview.frame ).on( 'mousemove mouseup', function ( e ) {
                jQuery( document ).trigger( e );
            } );

            // Bind the update function to input changes on the content textarea
            jQuery( '#content' ).on( 'input propertychange', RotorMD.preview.update );

            // Perform an initial update of the preview area
            RotorMD.preview.update();
        },

        update: function ( data ) {
            // Retrieve the current markdown content from the textarea
            var raw = jQuery( 'textarea#content' ).val();

            // Convert the raw markdown into HTML using the 'marked' library
            var content = marked( raw );

            // Insert the generated HTML into the iframe's body
            jQuery( '.mceContentBody', RotorMD.preview.frame ).html( content );

            // Trigger a custom event for word counting, passing the raw content
            jQuery( document ).triggerHandler( 'wpcountwords', [ raw ] );
        },
    },

    resizer: {

        init: function () {
            // Attach the mousedown event listener to the resize handle
            jQuery( '#content-resize-handle' ).on( 'mousedown', RotorMD.resizer.handler );
            // Perform an initial sizing adjustment
            RotorMD.resizer.during();
        },

        during: function ( e ) {
            // Dynamically adjust the height of the preview and CodeMirror editor
            jQuery( '#rme-preview,#wp-content-editor-container .CodeMirror' ).height( jQuery( 'textarea#content' ).outerHeight() + 'px' );
            // Prevent default browser drag behavior
            return false;
        },

        after: function ( e ) {
            // Unbind the mousemove event once resizing is complete
            jQuery( document ).unbind( 'mousemove', RotorMD.resizer.during );
            // Prevent default behavior
            return false;
        },

        handler: function( e ) {
            // Bind mousemove for continuous resizing and mouseup to end resizing
            jQuery( document ).mousemove( RotorMD.resizer.during ).mouseup( RotorMD.resizer.after );
            // Prevent default drag behavior from the browser
            return false;
        }
    }
};

// Assign localized data from the WordPress environment to RotorMD
RotorMD.localize = rotormdLocalize;