/*
 * This file defines the MessagePanelView class,
 * which extends View from 'space-pen' and provides
 * a panel for displaying messages within an Atom editor context.
 */

"use strict" ; // Enforce strict mode for cleaner code.


var /* Variable declarations for module dependencies */
  $ = require( 'space-pen' ).$
  , View = require( 'space-pen' ).View
  , inherits = require( './utils' ).inherits
  ; /* End of variable declarations */


/*
 * The MessagePanelView constructor initializes a new instance
 * with various parameters controlling its behavior and appearance.
 *
 * @param {object} params - Configuration parameters for the panel.
 */
var MessagePanelView = function ( params )
{
    // Initialize instance properties based on provided parameters or default values.
    this.title = params.title ;
    this.rawTitle = params.rawTitle || false ;
    this.speed = params.speed || 'fast' ; // Animation speed for toggling.
    this.panel = undefined ; // The Atom panel instance, initially undefined.
    this.maxHeight = params.maxHeight || '170px' ;
    this.autoScroll = params.autoScroll || false ;
    this.closeMethod = params.closeMethod || 'hide' ; // Method to use when closing ('hide' or 'destroy').
    this.recentMessagesAtTop = params.recentMessagesAtTop || false ;
    this.position = params.position || 'bottom' ; // Panel display position ('bottom' or 'top').
    this.messages = [ ] ; // Array to hold message views.

    // Call the parent constructor (View.apply) to set up the view.
    View.apply( this , arguments ) ;
} ; // End of MessagePanelView constructor.


// Establish inheritance: MessagePanelView inherits from View.
inherits( MessagePanelView , View ) ;


/*
 * Defines the static content for the MessagePanelView.
 * This method is called by space-pen to construct the DOM for the panel.
 */
MessagePanelView.content = function ( )
{
    // The main container div for the panel.
    this.div( {
        class: 'am-panel tool-panel panel-bottom native-key-bindings' , /* CSS classes for styling */
        tabindex: '-1' /* Make the panel focusable */
    } , function ( )
    {
        // Add a resize handle at the top of the panel.
        this.div( {
            class: 'panel-resize-handle' ,
            style: 'position: absolute; top: 0; left: 0; right: 0; height: 10px; cursor: row-resize; z-index: 3'
        } ) ;

        // The heading section of the panel.
        this.div( {
            class: 'panel-heading'
        } , function ( )
        {
            // Title element, which can be clicked to toggle the body.
            this.div( {
                class: 'heading-title inline-block' ,
                style: 'cursor: pointer' ,
                outlet: 'heading' , // space-pen outlet for easy access.
                click: 'toggle' // Click event handler.
            } ) ;

            // Summary element, to display a brief overview.
            this.div( {
                class: 'heading-summary inline-block' ,
                outlet: 'summary'
            } ) ;

            // Container for action buttons on the right.
            this.div( {
                class: 'heading-buttoms inline-block pull-right'
            } , function ( )
            {
                // Auto-scroll toggle button.
                this.div( {
                    class: 'heading-autoScroll inline-block icon-move-down' ,
                    style: 'cursor: pointer' ,
                    outlet: 'btnAutoScroll' ,
                    click: 'toggleAutoScroll'
                } ) ;

                // Fold/unfold (toggle) button.
                this.div( {
                    class: 'heading-fold inline-block icon-fold' ,
                    style: 'cursor: pointer' ,
                    outlet: 'btnFold' ,
                    click: 'toggle'
                } ) ;

                // Close button for the panel.
                this.div( {
                    class: 'heading-close inline-block icon-x' ,
                    style: 'cursor: pointer;' ,
                    outlet: 'btnClose' ,
                    click: 'close'
                } ) ;
            } .bind( this ) ) ; // Ensure 'this' context is correct.
        } .bind( this ) ) ; // Ensure 'this' context is correct.

        // The main body of the panel where messages will be displayed.
        this.div( {
            class: 'panel-body padded' ,
            outlet: 'body' ,
            style: 'overflow-y: scroll;' // Enable vertical scrolling for content.
        } ) ;
    } .bind( this ) ) ; // Ensure 'this' context is correct for the top-level div.
} ; // End of MessagePanelView.content method.


/*
 * Attaches the MessagePanelView to the Atom workspace.
 * This method creates and displays the panel if it doesn't already exist.
 */
MessagePanelView.prototype.attach = function ( )
{
    // Check if the panel has not been initialized yet.
    if ( this.panel === undefined )
    {
        // Determine panel position and add it to the Atom workspace.
        if ( this.position === 'bottom' )
        {
            this.panel = atom.workspace.addBottomPanel( { item: this } ) ;
        }
        else if ( this.position === 'top' )
        {
            this.panel = atom.workspace.addTopPanel( { item: this } ) ;
        }

        var that = this ; // Store 'this' for use in the event handler.
        // Set up a mousedown event listener on the resize handle.
        this.panel.item.on( "mousedown" , ".panel-resize-handle" , function ( )
        {
            that.resizeStarted( ) ; // Call the resizeStarted method.
        } ) ;

        // Apply max-height styling to the panel body.
        $( ".panel-body" , this ).css( {
            maxHeight: this.maxHeight // Set the maximum height.
        } ) ;

        // If auto-scroll is enabled and set to scroll to top, scroll to bottom.
        // (Note: `icon-move-up` indicates a desire to scroll to top,
        // but initial scroll might be to bottom for new messages if not recentMessagesAtTop)
        if ( this.btnAutoScroll.hasClass( 'icon-move-up' ) )
        {
            this.body.scrollTop( 1E10 ) ; // Scroll to a very large number to reach the bottom.
        }
    }
    else
    {
        // If the panel already exists, just show it.
        this.panel.show( ) ;
    }
} ; // End of attach method.


/*
 * Closes the MessagePanelView.
 * The actual closing behavior ('hide' or 'destroy') depends on this.closeMethod.
 */
MessagePanelView.prototype.close = function ( )
{
    // Check if the panel instance exists.
    if ( this.panel !== undefined )
    {
        // Call the specified close method on the panel.
        this.panel[ this.closeMethod ].call( this.panel ) ;
        // If the method was 'destroy', clear the panel reference.
        if ( this.closeMethod === 'destroy' )
        {
            this.panel = undefined ;
        }
    }
} ; // End of close method.


/*
 * Initializes the MessagePanelView after its DOM content has been created.
 * Sets the initial title, handles auto-scroll, and hides the summary.
 */
MessagePanelView.prototype.initialize = function ( )
{
    // Set the panel's title.
    this.setTitle( this.title , this.rawTitle ) ;
    // If auto-scroll is enabled, activate it.
    if ( this.autoScroll )
    {
        this.toggleAutoScroll( ) ;
    }
    // Initially hide the summary display.
    this.summary.hide( ) ;
} ; // End of initialize method.


/*
 * Sets the main title of the panel.
 *
 * @param {string} title - The title text to display.
 * @param {boolean} raw - If true, the title is set as HTML; otherwise, as plain text.
 */
MessagePanelView.prototype.setTitle = function ( title , raw )
{
    // Check if the title should be treated as raw HTML.
    if ( raw )
    {
        this.heading.html( title ) ; // Set as HTML.
    }
    else
    {
        this.heading.text( title ) ; // Set as plain text.
    }
} ; // End of setTitle method.


/*
 * Sets the summary message displayed in the panel heading.
 *
 * @param {object} summary - An object containing summary details.
 * @param {string} summary.summary - The actual summary message.
 * @param {string} [summary.className] - Optional CSS class to add to the summary element.
 * @param {boolean} [summary.rawSummary=false] - If true, summary is set as HTML.
 * @param {function} [summary.handler] - Optional function to call with the summary element.
 */
MessagePanelView.prototype.setSummary = function ( summary )
{
    var
      message = summary.summary , // The message content.
      className = summary.className , // Optional class name.
      raw = summary.rawSummary || false , // Flag for raw HTML.
      handler = summary.handler || undefined ; // Optional handler function.

    // Reset the class-attributes on the old summary element to its base state.
    this.summary.attr( 'class' , 'heading-summary inline-block' ) ;

    // Set the new summary content.
    if ( raw )
    {
        this.summary.html( message ) ; // Set as HTML.
    }
    else
    {
        this.summary.text( message ) ; // Set as plain text.
    }

    // If a className is provided, add it to the summary element.
    if ( className )
    {
        this.summary.addClass( className ) ;
    }

    // If a handler function is provided, execute it with the summary element.
    if ( handler )
    {
        handler( this.summary ) ;
    }
} ; // End of setSummary method.


/*
 * Toggles the visibility of the panel body and updates the fold button icon.
 * Also handles the display of the summary element.
 */
MessagePanelView.prototype.toggle = function ( )
{
    // Toggle the class of the fold button to change its icon.
    this.btnFold.toggleClass( 'icon-fold, icon-unfold' ) ;
    // Toggle the visibility of the panel body with an animation speed.
    this.body.toggle( this.speed ) ;

    /*
     * Because we want to toggle between display: 'none' and 'inline-block'
     * for the summary element, we cannot directly use .toggle() as it
     * typically toggles between 'none' and 'block'.
     */
    if ( this.summary.css( 'display' ) === 'none' )
    {
        this.summary.css( 'display' , 'inline-block' ) ; // Show as inline-block.
    }
    else
    {
        this.summary.hide( ) ; // Hide the summary.
    }
} ; // End of toggle method.


/*
 * Clears all messages from the panel.
 * This involves emptying the internal messages array and clearing the DOM body.
 */
MessagePanelView.prototype.clear = function ( )
{
    this.messages = [ ] ; // Reset the messages array.
    this.body.empty( ) ; // Remove all child elements from the body.
} ; // End of clear method.


/*
 * Adds a new message view to the panel.
 *
 * @param {View} view - The space-pen View object representing the message.
 */
MessagePanelView.prototype.add = function ( view )
{
    // If this is the first message and it provides a summary, use it.
    if ( this.messages.length === 0 && view.getSummary )
    {
        // This is the first message, so use its summary.
        this.setSummary( view.getSummary( ) ) ;
    }

    // Determine where to add the new message based on the 'recentMessagesAtTop' flag.
    if ( this.recentMessagesAtTop )
    {
        this.body.prepend( view ) ; // Add to the beginning.
    }
    else
    {
        this.body.append( view ) ; // Add to the end.
    }
    // Add the view to the internal messages array.
    this.messages.push( view ) ;
} ; // End of add method.


/*
 * Updates the scroll position of the panel body based on the auto-scroll setting.
 */
MessagePanelView.prototype.updateScroll = function ( )
{
    // If the auto-scroll button indicates scrolling to top (icon-move-up),
    // then actually scroll to the bottom to see new messages.
    // (This seems counter-intuitive based on the icon name, but matches original logic)
    if ( this.btnAutoScroll.hasClass( 'icon-move-up' ) )
    {
        this.body.scrollTop( 1E10 ) ; // Scroll to a very large value (effectively bottom).
    }
    else
    {
        this.body.scrollTop( 0 ) ; // Scroll to the very top.
    }
} ; // End of updateScroll method.


/*
 * Toggles the auto-scroll behavior and updates the scroll position.
 */
MessagePanelView.prototype.toggleAutoScroll = function ( )
{
    // Toggle the class of the auto-scroll button to change its icon.
    this.btnAutoScroll.toggleClass( 'icon-move-up' ) ;
    // Update the scroll position based on the new auto-scroll state.
    this.updateScroll( ) ;
} ; // End of toggleAutoScroll method.


/*
 * Initiates the panel resizing process when the resize handle is dragged.
 * Disables user selection and sets up mouse event listeners.
 */
MessagePanelView.prototype.resizeStarted = function ( )
{
    // Disable user text selection to prevent issues during resizing.
    $( this ).css( {
        WebkitUserSelect: 'none' // For Webkit browsers.
    } ) ;

    // Attach mousemove and mouseup handlers to the document.
    // The 'that' context is passed via event.data.
    $( document ).on( 'mousemove' , { that: this } , this.resizePanel ) ;
    $( document ).on( 'mouseup' , { that: this } , this.resizeStopped ) ;
} ; // End of resizeStarted method.


/*
 * Stops the panel resizing process.
 * Re-enables user selection and removes mouse event listeners.
 *
 * @param {jQuery.Event} e - The mouseup event object.
 */
MessagePanelView.prototype.resizeStopped = function ( e )
{
    // Re-enable user text selection.
    $( e.data.that ).css( {
        WebkitUserSelect: '' // Reset to default.
    } ) ;

    // Remove the mousemove and mouseup event handlers from the document.
    $( document ).off( 'mousemove' , this.resizePanel ) ;
    $( document ).off( 'mouseup' , this.resizeStopped ) ;
} ; // End of resizeStopped method.


/*
 * Handles the actual resizing of the panel body during a drag operation.
 * Calculates and sets the new maximum height for the panel body.
 *
 * @param {jQuery.Event} e - The mousemove event object.
 */
MessagePanelView.prototype.resizePanel = function ( e )
{
    var
      panelBody = $( ".panel-body" , e.data.that ) , // The panel body element.
      panelHeadingHeight = $( ".panel-heading" , e.data.that ).height( ) , // Height of the heading.
      // Calculate the new height based on mouse position, total body height, heading height, and a fixed offset.
      newHeight = $( document.body ).height( ) - e.pageY - panelHeadingHeight - 30 ;

    // Apply the calculated new maximum height to the panel body.
    panelBody.css( {
        maxHeight: newHeight
    } ) ;
} ; // End of resizePanel method.


// Export the MessagePanelView class for use in other modules.
module.exports = MessagePanelView ;