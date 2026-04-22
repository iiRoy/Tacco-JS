$( document ).ready( function () { // Initial function wrapper, changed spacing and indentation

    // This section for centering menu items is currently commented out.
    // It seems to be a placeholder or an old feature.
    // var topMenuWidth = $( "#top_navigation ul" ).width();
    // var mainContainerWidth = $( ".container" ).width();
    // var topMenuMarginLeft = ( mainContainerWidth - topMenuWidth ) / 2;
    // $( "#top_navigation ul" ).css( "margin-left", topMenuMarginLeft );

    /*
     * This block handles the display logic for nested menus within the top navigation.
     * The goal is to move the sub-menus from the main navigation into a dedicated
     * secondary menu container block.
     *
     * To properly utilize this functionality, ensure a div with id "sec_menu_container"
     * is present in your HTML layout, typically within a sidebar or column.
     *
     * Configuration example for a CMS or templating system:
     * BLOCK NAME: Secondary Menu Display
     * CONTENT: <div id="sec_menu_container"></div> (Use full-HTML input mode)
     * VISIBILITY SETTINGS: Display on all pages EXCEPT the front page.
     *
     * This ensures the secondary navigation appears contextually.
     */

    // Check if there are any expanded list items with nested unordered lists
    if ( $( "#top_navigation ul.menu li.expanded ul" ).html() != null ) {

        // Store the HTML content of the nested menu for later use.
        var secMenuCode = $( "ul.menu li.expanded ul" ).html();

        // Immediately remove the nested menu from its original position
        // to prevent duplicate content and prepare for relocation.
        $( "ul.menu li.expanded ul" ).remove();

        // Construct the new secondary menu structure by wrapping the stored HTML
        // in a new <ul> element with the "menu" class.
        var newSecMenu = "<ul class=\"menu\">" + secMenuCode + "</ul>";

        // Inject the newly created secondary menu into the designated container block.
        $( "#sec_menu_container" ).html( newSecMenu );

    } // End of nested menu processing logic


    // --- Start of the full-width layout adjustment patch ---

    // This section dynamically adjusts the content column width based on
    // the presence of text in the left and right sidebar columns.

    // Scenario 1: Both left and right columns are empty.
    // In this case, the content area should span the full width (sixteen columns).
    if ( ( $( "#leftCol" )[0].innerText == '' ) && ( $( "#rightCol_1" )[0].innerText == '' ) ) {
        $( "#content" ).attr( "class", "sixteen columns" );
    }

    // Scenario 2: Both left and right columns contain text.
    // Here, the content area needs to be narrower (eight columns) to accommodate both sidebars.
    else if ( ( $( "#leftCol" )[0].innerText != '' ) && ( $( "#rightCol_1" )[0].innerText != '' ) ) {
        $( "#content" ).attr( "class", "eight columns" );
    }

    // Scenario 3: Any other case (one of the sidebars is empty, but not both).
    else {

        // If the left column is empty, hide it.
        if ( $( "#leftCol" )[0].innerText == '' ) {
            $( "#leftCol" ).addClass( 'hidden' );
        }

        // If the right column is empty, hide it.
        if ( $( "#rightCol_1" )[0].innerText == '' ) {
            $( "#rightCol_1" ).addClass( 'hidden' );
        }

        // The content area will take up a medium width (twelve columns)
        // because only one sidebar is active or visible.
        $( "#content" ).attr( "class", "twelve columns" );
    } // End of layout adjustment if-else chain.

    // --- End of full-width patch ---

    // ===================================
    // Logic to hide H3 titles that are empty or contain only whitespace.
    // This improves visual cleanliness by removing redundant headings.
    // ===================================

    $( 'h3' ).each( function ( index ) {

        // Polyfill for String.prototype.trim() if not natively supported by the browser.
        // This ensures the .trim() method is available for all string manipulations.
        if ( typeof String.prototype.trim !== 'function' ) {
            String.prototype.trim = function () {
                return this.replace( /^\s+|\s+$/g, '' ); // Regex to remove leading/trailing whitespace
            }
        }

        // After ensuring .trim() is available, check if the trimmed text content of the H3 is empty.
        if ( $( this ).text().trim().length == 0 ) {
            $( this ).addClass( "hidden" ); // If empty, add the 'hidden' class to conceal the element.
        }

    } ); // End of each H3 iteration.

} ); // Closing tag for the document ready function.