( function ( ) {
    /*
     * MarkupWidget constructor function.
     * Establishes a new instance of the MarkupWidget component.
     *
     * This software is provided under the MIT License terms.
     * (C) 2023 CodeCrafters Inc.
     *
     * @class MarkupWidget
     * @constructor
     * @param { Object } settings A configuration object for the widget.
     *   Expected fields:
     *     - btnLabel: The display text for the activation button (defaults to '&lt;/&gt;').
     *     - injectionHTML: The HTML string to be placed into the editor.
     */
    function MarkupWidget ( settings )
    {
        this.actionBtn = document.createElement( 'button' ) ;
        this.actionBtn.className = 'editor-control-element' ;
        if  ( this.actionBtn.innerText )
        {
            this.actionBtn.innerText = settings.btnLabel || '&lt;/&gt;' ;
        }
        else
        {
            this.actionBtn.textContent = settings.btnLabel || '&lt;/&gt;' ;
        }
        this.actionBtn.onclick = this.handleActivation.bind( this ) ;
        this.componentSettings = settings ;
    }

    MarkupWidget.injectMarkupAtCursor = function ( contentString )
    {
        var currentSelection, selectionRange ;
        if ( window.getSelection )
        {
            // Modern browsers (including IE9+)
            currentSelection = window.getSelection( ) ;
            if ( currentSelection.getRangeAt && currentSelection.rangeCount )
            {
                selectionRange = currentSelection.getRangeAt( 0 ) ;
                selectionRange.deleteContents( ) ;

                // Note: createContextualFragment() offers a more direct way,
                // but its compatibility is not universal across older browsers.
                var tempDiv = document.createElement( 'div' ) ;
                tempDiv.innerHTML = contentString ;
                var docFragment = document.createDocumentFragment( ) , domNode , endingNode ;
                while ( ( domNode = tempDiv.firstChild ) )
                {
                    endingNode = docFragment.appendChild( domNode ) ;
                }
                selectionRange.insertNode( docFragment ) ;

                // Restore cursor position after insertion
                if ( endingNode )
                {
                    selectionRange = selectionRange.cloneRange( ) ;
                    selectionRange.setStartAfter( endingNode ) ;
                    selectionRange.collapse( true ) ;
                    currentSelection.removeAllRanges( ) ;
                    currentSelection.addRange( selectionRange ) ;
                }
            }
        }
        else if ( document.selection && document.selection.type !== 'Control' )
        {
            // Legacy Internet Explorer support
            document.selection.createRange( ).pasteHTML( contentString ) ;
        }
    } ;

    /*
     * handleActivation
     * This method serves as the event handler for the button click,
     * invoking the static HTML insertion utility.
     *
     * @method handleActivation
     * @returns { void }
     */
    MarkupWidget.prototype.handleActivation = function ( )
    {
        MarkupWidget.injectMarkupAtCursor( this.componentSettings.injectionHTML ) ;
    } ;

    /*
     * fetchControl
     * Provides the interactive button element for integration into a toolbar.
     * This method is typically invoked by a host editor component.
     *
     * @method fetchControl
     * @returns { HTMLButtonElement } The button element for external use.
     */
    MarkupWidget.prototype.fetchControl = function ( )
    {
        return this.actionBtn ;
    } ;

    // Expose the primary component globally
    window.MarkupWidget = MarkupWidget ;
} ) ( ) ;