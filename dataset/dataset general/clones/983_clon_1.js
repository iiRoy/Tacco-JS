/*
 *  Global application constants and core jQuery object references.
 *  These variables are initialized once and used throughout the script.
 */
var JS_VOID = 'javascript:void(0);'; // Standard URL fragment for void actions.
var _DOC = $( document );            // Cached jQuery object for the document.
var _Btn = $( '<button>', { 'class': 'btn', 'type': 'button' } ); // A base jQuery button element for cloning.
var _FirstModal; // Placeholder for the first, cloned modal instance.

  // --------------------------------------------------------------------------------------------------------------------------
  // Modal Event Handling and Custom Modal Creation Logic.
  // This section defines how modals behave and how new modals can be programmatically generated.
  // --------------------------------------------------------------------------------------------------------------------------

  // Attaches an event listener to all Bootstrap modals that do not have the 'noautofocus' class.
  // When such a modal is shown ('shown.bs.modal' event), it calls FocusInput on the modal's ID.
  $( '.modal:not(.noautofocus)' ) .on( 'shown.bs.modal', function( e ) {
      FocusInput( $( this ) .attr( 'id' ) );
  } );

  // Encapsulates modal-related functionality within a self-executing anonymous function,
  // passing jQuery as '$' to avoid conflicts and ensure scope.
  ( function( $ ) {

      /**
       *  @function $.DoModal
       *  @description Creates and displays a Bootstrap modal dialog based on the provided configuration arguments.
       *               This function supports both static content modals and modals that load content remotely.
       *  @param {object} args - Configuration object for the modal.
       *  @param {string} args.ModalID - A unique string identifier for the modal.
       *  @param {string} [args.Remote] - URL from which to load the modal's content remotely.
       *  @param {string} [args.SpecClass=''] - An optional CSS class to add to the modal-dialog element.
       *  @param {boolean} [args.IsStatic=false] - If true, the modal's content is provided directly via `args.Content`.
       *  @param {string} [args.Content] - HTML string to be used as the modal's body content for static modals.
       *  @param {Function} [args.ShownCallBack] - A callback function to be executed every time the modal is shown.
       *  @param {*} [args.ShownCallBackArgs] - Arguments to pass to the `ShownCallBack` function.
       *  @param {Function} [args.ShownCallBackOnce] - A callback function to be executed only the *first* time the modal is shown.
       *  @param {*} [args.ShownCallBackOnceArgs] - Arguments to pass to the `ShownCallBackOnce` function.
       *  @returns {void}
       */
      $.DoModal = function( args ) {

          var ModalID = args.ModalID;                               // The unique ID for the new or existing modal.
          var _ModalID = '#' + ModalID;                           // jQuery selector string for the modal.
          var Remote = args.Remote;                                 // URL for remote content loading.
          var SpecClass = args.SpecClass == undefined ? '' : args.SpecClass; // Optional custom class for the dialog.
          var IsStatic = args.IsStatic == true ? true : false;      // Flag to determine if content is static or remote.
          var Content = args.Content;                               // Static HTML content for the modal body.
          var ShownCallBack = args.ShownCallBack;                     // Callback for every 'shown' event.
          var ShownCallBackArgs = args.ShownCallBackArgs;             // Arguments for the recurring callback.
          var ShownCallBackOnce = args.ShownCallBackOnce;             // Callback for the first 'shown' event.
          var ShownCallBackOnceArgs = args.ShownCallBackOnceArgs;     // Arguments for the one-time callback.

          // Attempt to find an existing modal instance with the given ID.
          var CurModal = $( _ModalID );

          // If no existing modal is found, proceed to create a new one.
          if ( CurModal.length == 0 ) {
              CurModal = GetFirstModal() .clone(); // Clone the base modal structure.
              CurModal .attr( 'id', ModalID );    // Assign the unique ID to the new modal.

              // If a special class is provided, add it to the modal's dialog element.
              if ( SpecClass )
                  CurModal .find( '.modal-dialog' ) .addClass( SpecClass );

              // If the modal is not static, append a progress bar placeholder.
              // Otherwise, directly insert the static content into the modal body.
              if ( !IsStatic )
                  CurModal .append( ProgressBarHtml( true ) );
              else
                  CurModal .find( '.modal-content' ) .html( Content );

              CurModal .appendTo( 'body' ); // Attach the newly constructed modal to the document body.

              // Set up the 'shown.bs.modal' event handler for the new modal instance.
              CurModal .on( 'shown.bs.modal', function( e ) {
                  // Execute ShownCallBackOnce only if it's defined and the modal hasn't been "inited" yet.
                  if ( ShownCallBackOnce != undefined && CurModal .attr( "state" ) != "inited" ) {
                      ShownCallBackOnce( ShownCallBackOnceArgs );
                      CurModal .attr( "state", "inited" ); // Mark the modal as initialized.
                  }
                  // Execute ShownCallBack if it's defined.
                  if ( ShownCallBack != undefined )
                      ShownCallBack( ShownCallBackArgs );
                  // If not a static modal, remove any progress bar after content is loaded/shown.
                  if ( !IsStatic )
                      DeleteFSBar();
              } );

              // If the modal is configured for remote content loading.
              if ( !IsStatic ) {
                  // Trigger Bootstrap's remote modal loading mechanism.
                  CurModal .modal( { remote: Remote } );
                  return; // Exit, as the modal will be shown asynchronously after content loads.
              }
          }

          // For existing modals or static modals, show the modal immediately.
          CurModal .modal( { show: true } );
      };

  } )( jQuery ); // Pass jQuery into the IIFE to use '$' internally.


/*
 *  Function: GetFirstModal
 *  --------------------------------------------------------------------------------------------------------------------------
 *  Retrieves or creates a base Bootstrap modal structure. This function ensures that
 *  a standard modal template is available, caching it after its first creation for efficiency.
 */
function GetFirstModal()
{
    // If the base modal has already been instantiated and cached, return the cached instance.
    if ( _FirstModal )
        return _FirstModal;

    // Define the core elements of a Bootstrap modal using jQuery.
    var Modal = $( '<div>', { 'class': 'modal fade', 'id': 'FirstModal', 'tabindex': '-1', 'role': 'dialog', 'aria-hidden': 'true' } );
    var Dialog = $( '<div>', { 'class': 'modal-dialog' } );
    var Content = $( '<div>', { 'class': 'modal-content' } );
    var Header = $( '<div>', { 'class': 'modal-header' } );
    var Body = $( '<div>', { 'class': 'modal-body' } );
    var Footer = $( '<div>', { 'class': 'modal-footer' } );
    var Close = $( '<button>', { 'class': 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true' } );
    Close .html( '&times;' ); // Set the HTML for the close button (the 'x' symbol).
    var H1 = $( '<h1>' ); // A placeholder for the modal title.

    // Create 'Cancel' button by cloning the base button and adding specific classes and attributes.
    var Cancel = _Btn .clone()
                      .addClass( 'btn-default cancel' )
                      .attr( 'data-dismiss', 'modal' )
                      .text( '取消' );

    // Create 'OK' button by cloning the base button and adding specific classes and attributes.
    var OK = _Btn .clone()
                  .addClass( 'btn-default ok' )
                  .attr( 'data-dismiss', 'modal' )
                  .text( '确认' );

    // Assemble the modal's structure by appending child elements in the correct hierarchy.
    Modal .append(
        Dialog .append(
            Content
                .append( Header .append( Close ) .append( H1 ) ) // Header contains close button and title.
                .append( Body )                                  // The main content area of the modal.
                .append( Footer .append( Cancel ) .append( OK ) )  // Footer contains action buttons.
        )
    ) .appendTo( $( 'body' ) ); // Append the complete modal structure to the document body.

    // Cache the newly created modal instance for future reuse.
    _FirstModal = $( '#FirstModal' );

    // Return the cached modal object.
    return _FirstModal;
}


/**
 * @function Sanitize
 * @description Processes an HTML string to ensure proper block-level structuring.
 *              It wraps inline content and text nodes in `<p>` tags and removes
 *              elements that are essentially empty or contain only invisible spaces.
 * @param {string} Html - The raw HTML content to be sanitized.
 * @returns {string} The sanitized and re-structured HTML string.
 */
function Sanitize( Html )
{
    // A list of common HTML block-level tags.
    var BlockTags = [ 'P', 'BLOCKQUOTE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'OL', 'UL', 'PRE' ];
    var Content = $( '<div>' ); // A temporary jQuery div to hold and manipulate the HTML.

    // Load the input HTML string into the temporary container.
    Content .html( Html );

    // Remove any text nodes that contain only whitespace (excluding non-breaking spaces).
    CleanEmptyTextNode( Content .get( 0 ) );

    // Initialize temporary jQuery objects for wrapping content.
    var AllChildren = Content .contents(); // Get all direct children, including text nodes.
    var TempP = $( '<p>' );             // A temporary paragraph element to accumulate inline content.
    var TempDiv = $( '<div>' );           // A temporary div to hold the final, structured block elements.

    // Iterate through each immediate child node to determine its type and proper placement.
    for ( i = 0; i < AllChildren .length; i++ )
    {
        var Node = $( AllChildren[ i ] ); // Wrap the current DOM node in a jQuery object.

        // If the node is a text node (nodeType 3), append it to the current temporary paragraph.
        if ( Node .get( 0 ) .nodeType === 3 )
        {
            Node .appendTo( TempP );
            continue; // Move to the next child.
        }

        var tagName = Node .prop( "tagName" ); // Get the uppercase tag name of the element.

        // If the current node's tag is not in the list of block-level tags.
        if ( $.inArray( tagName, BlockTags ) == -1 )
        {
            Node .appendTo( TempP ); // Append it to the temporary paragraph.
        }
        else // If the current node is a block-level tag.
        {
            // If the temporary paragraph has accumulated any content, append it to TempDiv
            // and then reset TempP for the next sequence of inline content.
            if ( TempP .contents() .length != 0 )
            {
                TempP .appendTo( TempDiv );
                TempP = $( '<p>' );
            }
            // Append the current block-level node directly to TempDiv.
            Node .appendTo( TempDiv );
        }
    }

    // After processing all children, if TempP still contains any content, append it to TempDiv.
    if ( TempP .contents() .length != 0 )
    {
        TempP .appendTo( TempDiv );
    }


    // Filter and remove "invalid" elements:
    // Elements that are not <br> tags AND whose text content consists only of invisible spaces
    // (assuming 'wysihtml5.INVISIBLE_SPACE' is defined elsewhere).
    Content .find( '*' ) .filter( function() {
        if ( $( this ) .prop( "tagName" ) == 'BR' )
            return false; // Keep <br> tags, they are valid.
        var text = $( this ) .text(); // Get the combined text content of the element.
        for ( var i = 0; i < text .length; i++ )
            if ( text[ i ] != wysihtml5 .INVISIBLE_SPACE ) // Check if any character is not an invisible space.
                return false; // If a visible character is found, do not remove the element.
        return true; // If the element contains only invisible spaces (or is empty), mark for removal.
    } ) .remove(); // Execute the removal of identified invalid elements.

    // Return the HTML content of the structured temporary div.
    return TempDiv .html();
}

/**
 * @function CleanEmptyTextNode
 * @description Recursively traverses a DOM node and its children to identify and remove
 *              text nodes that consist solely of whitespace characters, excluding non-breaking spaces.
 * @param {Node} Node - The starting DOM node from which the cleaning process should begin.
 * @returns {void}
 */
function CleanEmptyTextNode( Node )
{
    // Regular expression to test if a string contains only whitespace characters (spaces, tabs, newlines, etc.).
    var WhiteSpaceMatcher = /^\s+$/;

    // Regular expression to test if a string contains one or more non-breaking space characters.
    var NonBreakSpaceMatcher = /\u00A0+/;

    // An array to store references to text nodes that are determined to be empty and should be deleted.
    var DeleteNodes = [];


    /**
     * @inner
     * @function RecursiveClean
     * @description A recursive helper function that performs the traversal and identification of nodes to delete.
     * @param {Node} node - The current node being processed during the recursion.
     * @returns {void}
     */
    function RecursiveClean( node )
    {
        var v = node .nodeValue; // Retrieve the text content of the current node.

        // Check if the current node is a text node (nodeType === 3),
        // and if its value consists entirely of whitespace,
        // and importantly, if it does NOT contain any non-breaking spaces.
        if ( node .nodeType == 3 && WhiteSpaceMatcher .test( v ) && !NonBreakSpaceMatcher .test( v ) )
        {
            DeleteNodes .push( node ); // If all conditions met, add this text node to the deletion list.
        }
        else // If the node is not a deletable text node (e.g., an element node or a non-empty text node).
        {
            // Iterate through all child nodes and recursively call RecursiveClean on each.
            for ( var i = 0, len = node .childNodes .length; i < len; ++i )
            {
                RecursiveClean( node .childNodes[ i ] );
            }
        }
    }

    // Initiate the recursive cleaning process starting from the provided root Node.
    RecursiveClean( Node );

    // After the recursive traversal completes and all deletable nodes are identified,
    // iterate through the DeleteNodes array and remove each node from its parent.
    for ( var i = 0, len = DeleteNodes .length; i < len; ++i )
    {
        var n = DeleteNodes[ i ]; // Get the current node to be removed.
        n .parentNode .removeChild( n ); // Remove the node from its parent in the DOM.
    }
}