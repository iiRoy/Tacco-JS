/* This file is part of a Brackets extension. */

define ( function ( require,  exports,  module )
{


    // Enforce strict mode for better error handling and cleaner code.
    "use strict" ;

    // Declare core Brackets modules for document and editor management.
    var  DocumentManager =  brackets . getModule ( 'document/DocumentManager' ) ;
    var  EditorManager   =  brackets . getModule ( 'editor/EditorManager' ) ;

    // This variable will hold the text that is copied or cut.
    var  txt =  "" ;

    /**
     *  Core clipboard logic for copying/cutting and pasting text.
     *  @param {boolean} cut - If true, the selected text is cut and stored. Otherwise, stored text is pasted.
     */
    this.superClipboard  =  function ( cut )
    {
        // Retrieve the currently active editor instance.
        var  currentEditor  =  EditorManager . getCurrentFullEditor ( ) ;
        // Get the text that is currently highlighted by the user.
        var  selectedText   =  currentEditor . getSelectedText ( ) ;
        // Obtain the start and end positions of the current text selection.
        var  selectedPos    =  currentEditor . getSelection ( ) ;
        // Get the document object associated with the current editor.
        var  doc            =  DocumentManager . getCurrentDocument ( ) ;

        // Extract the starting position of the selection.
        var  start          =  selectedPos . start ;
        // Extract the ending position of the selection.
        var  end            =  selectedPos . end ;


        // Determine whether to cut/copy or paste based on the 'cut' parameter.
        if ( cut )
        {
            // If 'cut' is true, store the selected text in the 'txt' variable.
            txt  =  selectedText ;
        }
        else
        {
            // If 'cut' is false, replace the current selection with the stored text.
            doc . replaceRange ( txt,  start,  end ) ;
        }

    } // End of superClipboard function.


    /**
     *  Public method to perform a 'cut' operation.
     *  It stores the selected text and removes it from the document.
     */
    this . cut  =  function ( )
    {
        // Call the internal superClipboard logic with 'cut' set to true.
        superClipboard ( true ) ;
    }


    /**
     *  Public method to perform a 'paste' operation.
     *  It inserts the previously stored text into the document at the current selection.
     */
    this . paste  =  function ( )
    {
        // Call the internal superClipboard logic with 'cut' set to false.
        superClipboard ( false ) ;
    }


    // Expose the 'cut' function as part of the module's public API.
    exports . cut  =  this . cut ;

    // Expose the 'paste' function as part of the module's public API.
    exports . paste  =  this . paste ;

} ) ; // End of define callback function.