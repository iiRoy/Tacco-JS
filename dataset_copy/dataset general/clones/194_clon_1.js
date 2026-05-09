( function ( $ )
{
    /* This is the main plugin function for MadnessEnjineer.
     * It initializes the RTE (Rich Text Editor) functionality
     * on the selected jQuery element. */
    $.fn.MadnessEnjineer = function ( options )
    {

        // --- Core Helper Functions ---
        /**
         * Saves the current text selection using Rangy.
         * This is crucial for maintaining selection across UI interactions.
         */
        function saveSelection ( )
        {
            // Remove any previously saved selection markers to keep the DOM clean
            if ( savedSel )
            {
                rangy.removeMarkers ( savedSel ) ;
            }
            // Save the current selection state
            savedSel = rangy.saveSelection ( ) ;
            // Also save the currently active element, in case focus needs restoring
            savedSelActiveElement = document.activeElement ;
        }


        /**
         * Restores a previously saved text selection.
         * Useful after an action might have caused the selection to be lost.
         */
        function restoreSelection ( )
        {
            // Check if a selection was actually saved
            if ( savedSel )
            {
                // Restore the selection using Rangy, true means to select the range
                rangy.restoreSelection ( savedSel , true ) ;
                // Use a short timeout to ensure focus is restored after other DOM updates
                window.setTimeout ( function ( )
                {
                    // If an active element was saved, attempt to re-focus it
                    if ( savedSelActiveElement && typeof savedSelActiveElement.focus != "undefined" )
                    {
                        savedSelActiveElement.focus ( ) ;
                    }
                } , 1 ) ; // A very short delay
            }
        }

        // --- Configuration and Global Variables ---

        /* Set up default options for the RTE.
         * These can be overridden by the 'options' parameter. */
        var opts = $.extend (
            {
                rte_id: "rte-wysiwyg" , /* ID for the WYSIWYG editor div */
                rte_code: "rte-code" , /* ID for the code view div */
                rte_preview: "rte-preview" , /* ID for the preview div */
                rte_tabs: "rte-tabs" , /* ID for the tab navigation element */
                rte_controls: "rte-controls" /* ID for the editor control buttons */
            } ,
            options
        ) ,

            /* --- Global Variables for the Editor Instance --- */
            editor , // ACE editor instance
            savedSel = null , // Stores Rangy selection object
            savedSelActiveElement = null , // Stores the DOM element that was active when selection was saved
            $this = $( this ) ; // Cache the jQuery object for the element on which the plugin was called


        // --- Initialize Document Editing Commands ---
        // Enable 'insertBrOnReturn' for better new line handling
        document.execCommand ( 'insertBrOnReturn' , false , true ) ;
        // Enable object resizing within the editable area
        document.execCommand ( 'enableObjectResizing' , false , true ) ;

        // --- Editor View Creation ---

        // Create the WYSIWYG editor element
        $rte = $( "<div />" ) . attr (
            {
                id: opts.rte_id ,
                contentEditable: "true" , // Make the div editable
                unselectable: "false" // Allow selection within the div
            }
        ) . html ( $this.html ( ) ) ; // Populate with initial content

        // Create the code view element
        $code = $( "<div />" ) . attr (
            {
                id: opts.rte_code
            }
        ) ;

        // Create the preview element
        $preview = $( "<div />" ) . attr (
            {
                id: opts.rte_preview
            }
        ) ;


        // --- Build the Rich Text Editor Structure ---

        // Place the WYSIWYG editor into the target element
        $this.html ( $rte ) ;

        // If code view is enabled, append it
        if ( opts.rte_code )
        {
            $code.html ( $rte.html ( ) ) ; // Initialize code view with WYSIWYG content
            $this.append ( $code ) ;
        }

        // If preview is enabled, append it
        if ( opts.rte_preview )
        {
            $this.append ( $preview ) ;
        }

        // If tabs are used, apply necessary classes and initialize Bootstrap tabs
        if ( opts.rte_tabs )
        {
            $( '#' + opts.rte_id ) . addClass ( "tab-pane, active" ) ;
            $( '#' + opts.rte_code ) . addClass ( "tab-pane" ) ;
            $( '#' + opts.rte_preview ) . addClass ( "tab-pane" ) ;
            $( '#' + opts.rte_tabs ) . tab ( ) ;
        }


        // --- Initialize ACE Editor for Code View ---

        // Create an ACE editor instance on the code view element
        editor = ace.edit ( opts.rte_code ) ;
        // Set the ACE editor's mode to HTML
        editor.getSession ( ) . setMode ( "ace/mode/html" ) ;


        // --- Event Handlers for Editor Functionality ---

        /* Handle click on the preview tab to update its content
         * with the current WYSIWYG editor content. */
        $( '#' + opts.rte_preview ) . on ( "click" , function ( )
        {
            $( '#' + opts.rte_preview ) . html ( $( '#' + opts.rte_id ) . html ( ) ) ;
        } ) ;

        /* Listen for changes in the ACE editor session.
         * When the code changes, update the WYSIWYG editor's content. */
        editor.getSession ( ) . on ( "change" , function ( )
        {
            try
            {
                $( "#" + opts.rte_id ) . html ( editor.getSession ( ) . getValue ( ) ) ;
            }
            catch ( e )
            {
                console.log ( e ) ; // Log any errors during update
            }
        } ) ;

        /* Event handler for switching to code or preview tabs.
         * Hides the RTE controls and adjusts the bottom position of the editor. */
        $( ".tab-code, .tab-preview" ) . on ( "mousedown" , function ( e )
        {
            $( "#" + opts.rte_controls ) . fadeOut ( ) ;
            $( "#rte" ) . css ( "bottom" , "0" ) ;
        } ) ;

        /* Event handler for switching to the WYSIWYG tab.
         * Shows the RTE controls and adjusts the bottom position. */
        $( ".tab-wysiwyg" ) . on ( "mousedown" , function ( )
        {
            $( "#" + opts.rte_controls ) . fadeIn ( ) ;
            $( "#rte" ) . css ( "bottom" , "33px" ) ;
        } ) ;

        /* Listen for input or blur events on the WYSIWYG editor.
         * When content changes, update the ACE code editor. */
        $( document ) . on ( "input, blur" , "#" + opts.rte_id , function ( )
        {
            try
            {
                editor.getSession ( ) . setValue ( $( "#" + opts.rte_id ) . html ( ) ) ;
            }
            catch ( e )
            {
                console.log ( e ) ; // Log errors
            }
        } ) ;

        // --- Color Picker Functionality ---

        /* Handles mousedown on background and foreground color pickers.
         * Saves selection before opening color picker and triggers input click. */
        $( '[data-rte="bColor"],[data-rte="fColor"]' ) . on ( "mousedown" , function ( )
        {
            saveSelection ( ) ; // Save selection before potentially losing focus
            $( this ) . find ( "input" ) . trigger ( "click" ) ; // Open the native color picker
            return false ; // Prevent default mousedown behavior
        } ) ;

        /* Event for background color change.
         * Currently applies background color to the RTE div itself. */
        $( '[data-rte="bColor"] input' ) . on ( "change" , function ( )
        {
            // document.execCommand('backColor', false, $(this).val()); // Original commented line
            $rte.css ( "background-color" , $( this ) . val ( ) ) ; // Apply to RTE container
            // $('[data-rte="bColor"] i').css('color',$(this).val()); // Another commented line
        } ) ;

        /* Event for foreground (text) color change.
         * Restores selection and applies color using execCommand. */
        $( '[data-rte="fColor"] input' ) . on ( "change" , function ( )
        {
            restoreSelection ( ) ; // Restore selection to apply color correctly
            document.execCommand ( 'foreColor' , false , $( this ) . val ( ) ) ;
        } ) ;


        // --- Basic Text Formatting Commands ---

        // Bold text command
        $( '[data-rte="bold"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'bold' , false , null ) ;
            return false ; // Prevent default
        } ) ;

        // Italicize text command
        $( '[data-rte="italic"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'italic' , false , null ) ;
            return false ;
        } ) ;

        // Underline text command
        $( '[data-rte="underline"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'underline' , false , null ) ;
            return false ;
        } ) ;

        // Strikethrough text command
        $( '[data-rte="strike"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'strikeThrough' , false , null ) ;
            return false ;
        } ) ;

        // Left align text command
        $( '[data-rte="aLeft"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'justifyLeft' , false , null ) ;
            return false ;
        } ) ;

        // Center align text command
        $( '[data-rte="aCenter"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'justifyCenter' , false , null ) ;
            return false ;
        } ) ;

        // Right align text command
        $( '[data-rte="aRight"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'justifyRight' , false , null ) ;
            return false ;
        } ) ;

        // Justify full text command
        $( '[data-rte="aJustify"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'justifyFull' , false , null ) ;
            return false ;
        } ) ;

        // Create unordered list command
        $( '[data-rte="ul"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'insertUnorderedList' , false , null ) ;
            return false ;
        } ) ;

        // Create ordered list command
        $( '[data-rte="ol"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'insertOrderedList' , false , null ) ;
            return false ;
        } ) ;

        // Insert paragraph command
        $( '[data-rte="p"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'insertParagraph' , false , null ) ;
            return false ;
        } ) ;

        // Indent command
        $( '[data-rte="indent"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'indent' , false , null ) ;
            return false ;
        } ) ;

        // Outdent command
        $( '[data-rte="outdent"]' ) . on ( "mousedown" , function ( )
        {
            document.execCommand ( 'outdent' , false , null ) ;
            return false ;
        } ) ;

        // Create link command (prompts user for URL)
        $( '[data-rte="link"]' ) . on ( "mousedown" , function ( )
        {
            var link = prompt ( "Please enter link address" ) ; // Get link from user

            // Only create link if a valid URL is provided
            if ( link && link != '' && link != 'http://' )
            {
                document.execCommand ( 'createlink' , false , link ) ;
            }
            return false ;
        } ) ;

    } ; // End of $.fn.MadnessEnjineer function

} ) ( jQuery ) ; // Pass jQuery object to the immediately invoked function expression