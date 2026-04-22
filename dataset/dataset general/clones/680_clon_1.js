/*
 * This JavaScript code defines a 'storage' utility object,
 * several functions for handling editor content, saving files,
 * and initializes a CodeMirror editor instance.
 * It also includes event listeners for keyboard shortcuts and drag-and-drop.
 */

var storage =
{
    // --- STORAGE UTILITY METHODS ---

    /**
     * Retrieves an item from localStorage by its key.
     * @param {string} key - The key of the item to retrieve.
     * @returns {string | null} The value associated with the key, or null if not found.
     */
    get: ( function ( key )
    {
        return localStorage.getItem( key );
    } ),


    /**
     * Sets an item in localStorage.
     * Also creates a temporary data object (though not used further in this snippet).
     * @param {string} key   - The key for the item.
     * @param {string} value - The value to store.
     */
    set: ( function ( key , value )
    {
        localStorage.setItem( key , value );
        // A data object is created here, but its purpose is unclear as it's not returned or used globally.
        var data = {};
        data[ key ] = value;
    } ),


    /**
     * Checks if localStorage contains an item with the specified key.
     * @param {string} key - The key to check for existence.
     * @returns {boolean} True if the key exists, false otherwise.
     */
    has: ( function ( key )
    {
        if ( localStorage.hasOwnProperty( key ) )
        {
            return true;
        }
        else
        {
            return false;
        }
    } ),


    /**
     * Removes an item from localStorage by its key.
     * @param {string} key - The key of the item to remove.
     */
    remove: ( function ( key )
    {
        localStorage.removeItem( key );
    } ),
}; // End of storage object definition


/**
 * Updates the editor content and saves it to storage.
 * Also updates the output display.
 * @param {object} e - The editor event object, containing the new value.
 */
function update ( e )
{
    // Get the current value from the editor.
    var val = e.getValue();

    // Store the editor's content in localStorage, stringified.
    storage.set( 'editor.content' , JSON.stringify( val ) );

    // Update the displayed output with the new value.
    setOutput( val );
} // End of update function


/**
 * Sets the content of the output display area.
 * Assumes 'marked' is a global function for Markdown rendering.
 * @param {string} val - The Markdown content to render and display.
 */
function setOutput ( val )
{
    // Find the 'out' element and set its inner HTML to the marked-up content.
    document.getElementById( 'out' ).innerHTML = marked( val );
} // End of setOutput function


/**
 * Saves the current editor content to a file.
 * Creates a Blob from the content and then calls saveBlob.
 */
function save ()
{
    // Retrieve the current code from the editor.
    var code = editor.getValue();

    // Create a Blob object with the code content and specified MIME type.
    var blob = new Blob( [ code ] , { type: 'text/plain' } );

    // Delegate the actual file saving to the saveBlob function.
    saveBlob( blob );
} // End of save function


/**
 * Handles saving a Blob object as a file to the user's system.
 * Tries different methods based on browser capabilities.
 * @param {Blob} blob - The Blob object to be saved.
 */
function saveBlob ( blob )
{
    // Default file name for the saved content.
    var name = "untitled.md";

    // Check if the browser supports the 'saveAs' function (e.g., FileSaver.js).
    if ( window.saveAs )
    {
        window.saveAs( blob , name );
    }
    // Check for navigator.saveBlob (older or specific browser implementations).
    else if ( navigator.saveBlob )
    {
        navigator.saveBlob( blob , name );
    }
    // Fallback for browsers that don't have direct saveAs/saveBlob (e.g., by simulating a click on a download link).
    else
    {
        // Create an object URL for the blob.
        url = URL.createObjectURL( blob );

        // Create a temporary anchor element.
        var link = document.createElement( "a" );

        // Set the href to the object URL.
        link.setAttribute( "href" , url );

        // Set the download attribute to suggest a file name.
        link.setAttribute( "download" , name );

        // Create a mouse event to simulate a click.
        var event = document.createEvent( 'MouseEvents' );

        // Initialize the click event.
        event.initMouseEvent( 'click' , true , true , window , 1 , 0 , 0 , 0 , 0 , false , false , false , false , 0 , null );

        // Dispatch the simulated click event on the link.
        link.dispatchEvent( event );
    }
} // End of saveBlob function


// --- EVENT LISTENERS ---

/*
 * Listens for the 'keydown' event across the document
 * to capture Ctrl+S (or Cmd+S on Mac) for saving.
 */
document.addEventListener( 'keydown' , function ( e )
{
    // Check if the key pressed is 'S' (keyCode 83)
    // and if Ctrl key (Windows/Linux) or Meta key (Mac) is also pressed.
    if ( e.keyCode == 83 && ( e.ctrlKey || e.metaKey ) )
    {
        // Prevent the default browser save action.
        e.preventDefault();

        // Call the custom save function.
        save();

        // Stop further propagation of the event.
        return false;
    }
} ) // End of keydown listener


/*
 * Listens for the 'drop' event on the document
 * to handle file drag-and-drop operations.
 */
document.addEventListener( 'drop' , function ( e )
{
    // Prevent the default browser behavior for drop (e.g., opening the file).
    e.preventDefault();
    // Stop event propagation.
    e.stopPropagation();

    // Get the first file from the data transfer.
    var theFile = e.dataTransfer.files[ 0 ];

    // Create a new FileReader to read the file content.
    var theReader = new FileReader();

    // Define the onload event handler for the FileReader.
    theReader.onload = function ( e )
    {
        // Set the editor's value to the content of the dropped file.
        editor.setValue( e.target.result );
    };

    // Read the file content as text.
    theReader.readAsText( theFile );
} , false ); // End of drop listener


// --- MARKED.JS CONFIGURATION ---

/*
 * Configures the 'marked' library for Markdown rendering.
 * Specifically sets up syntax highlighting using 'highlight.js'.
 */
marked.setOptions( {
    /**
     * Custom highlight function for marked.js.
     * Uses hljs (highlight.js) to automatically detect and highlight code blocks.
     * @param {string} code - The code string to highlight.
     * @returns {string} The HTML-highlighted code.
     */
    highlight: function ( code )
    {
        return hljs.highlightAuto( code ).value;
    }
} ); // End of marked.setOptions


// --- BROWSER API POLYFILLS / NORMALIZATIONS ---

// Normalize URL object across different browsers.
var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

// Normalize navigator.saveBlob for cross-browser compatibility.
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;

// Normalize window.saveAs for cross-browser compatibility.
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;


// --- EDITOR INITIALIZATION ---

// Declare a variable to hold the CodeMirror editor instance.
var editor;

/*
 * Check if there's saved editor content in local storage.
 * If yes, initialize CodeMirror with the saved content.
 * Otherwise, initialize it from a textarea element.
 */
if ( storage.has( 'editor.content' ) )
{
    // Retrieve and parse the saved content.
    content = JSON.parse( storage.get( 'editor.content' ) );

    // Initialize CodeMirror directly on the document body with saved content.
    editor = CodeMirror( document.body , {
        value: content ,             // Initial content for the editor.
        mode: 'gfm' ,                // GitHub Flavored Markdown mode.
        lineNumbers: true ,          // Display line numbers.
        matchBrackets: true ,        // Highlight matching brackets.
        lineWrapping: true ,         // Enable line wrapping.
        theme: 'default' ,           // Use the 'default' theme.
    } );
}
else
{
    // If no saved content, initialize CodeMirror from a specific textarea element.
    editor = CodeMirror.fromTextArea( document.getElementById( 'code' ) , {
        mode: 'gfm' ,                // GitHub Flavored Markdown mode.
        lineNumbers: true ,          // Display line numbers.
        matchBrackets: true ,        // Highlight matching brackets.
        lineWrapping: true ,         // Enable line wrapping.
        theme: 'default' ,           // Use the 'default' theme.
    } );
} // End of editor initialization conditional block


// --- POST-INITIALIZATION ACTIONS ---

// Perform an initial update to display the editor's content.
update( editor );

// Attach the 'update' function as a listener for editor 'change' events.
editor.on( 'change' , update );

// Set focus to the editor for immediate interaction.
editor.focus();