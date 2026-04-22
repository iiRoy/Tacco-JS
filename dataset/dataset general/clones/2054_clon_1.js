$(document) . ready (function () {

    // Check for browser support of the 'onhashchange' event.
    var supportsHashChange = 'onhashchange' in window ;

    // Define the vocabulary array, listing various CSS tokens and their human-readable names.
    // Each object within this array represents a distinct syntactic construct or concept in CSS.
    var vocab = [
        {
            'tokenName' : 'comment' ,
            'humanName' : 'Comment' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'statement' ,
            'humanName' : 'Statement' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'rule-set' ,
            'humanName' : 'Rule-set' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'at-rule' ,
            'humanName' : 'At-rule' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'media-query' ,
            'humanName' : 'Media query' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'media-query-list' ,
            'humanName' : 'Media query list' ,
            'url' : ''
        } ,


        {
            'tokenName' : 'media-type' ,
            'humanName' : 'Media type' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'expression' ,
            'humanName' : 'Expression' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'media-feature' ,
            'humanName' : 'Media feature' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'block' ,
            'humanName' : 'Block' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'declaration-block' ,
            'humanName' : 'Declaration block' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'selector' ,
            'humanName' : 'Selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'simple-selector' ,
            'humanName' : 'Simple selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'type-selector' ,
            'humanName' : 'Type selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'universal-selector' ,
            'humanName' : 'Universal selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'id-selector' ,
            'humanName' : 'ID selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'class-selector' ,
            'humanName' : 'Class selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'attribute-selector' ,
            'humanName' : 'Attribute selector' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'pseudo-class' ,
            'humanName' : 'Pseudo-class' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'pseudo-element' ,
            'humanName' : 'Pseudo-element' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'combinator' ,
            'humanName' : 'Combinator' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'descendant-combinator' ,
            'humanName' : 'Descendant combinator' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'child-combinator' ,
            'humanName' : 'Child combinator' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'adjacent-sibling-combinator' ,
            'humanName' : 'Adjacent sibling combinator' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'general-sibling-combinator' ,
            'humanName' : 'General sibling combinator' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'declaration' ,
            'humanName' : 'Declaration' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'property' ,
            'humanName' : 'Property' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'value' ,
            'humanName' : 'Value' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'function' ,
            'humanName' : 'Function' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'keyword' ,
            'humanName' : 'Keyword' ,
            'url' : ''
        } ,
        /*
         * The 'identifier' token is currently commented out.
         * It is not actively used in the current version of the vocabulary list.
         * {
         *   'tokenName': 'identifier',
         *   'humanName': 'Identifier',
         *   'url': ''
         * },
         */
        {
            'tokenName' : 'string' ,
            'humanName' : 'String' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'url' ,
            'humanName' : 'URL' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'number' ,
            'humanName' : 'Number' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'percentage' ,
            'humanName' : 'Percentage' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'length' ,
            'humanName' : 'Length' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'unit' ,
            'humanName' : 'Unit' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'color' ,
            'humanName' : 'Color' ,
            'url' : ''
        } ,
        {
            'tokenName' : 'vendor-prefix' ,
            'humanName' : 'Vendor prefix' ,
            'url' : ''
        } ,
    ] ;

    // Function responsible for dynamically generating and populating the vocabulary list
    // in the sidebar of the application interface.
    function buildVocabList (vocab) {
        var vocabListItems = [ ] ; // Array to hold generated list item HTML strings.
        var text ; // Variable to store the human-readable name.
        var token ; // Variable to store the token name.

        // Loop through each entry in the provided vocabulary array.
        $.each (vocab , function (i , val) {
            text = val . humanName ; // Get the display name.
            token = val . tokenName ; // Get the CSS token class name.
            // Create an HTML list item with a link, using tokenName for class and href.
            vocabListItems . push ('<li class="'+token+'"><a href="#'+token+'">'+text+'</a></li>') ;
        }) ;

        // Append all constructed list items to the element identified by the '.vocabList' class.
        $('.vocabList') . append (vocabListItems . join ('')) ;
    }

    // Call the function to build the vocabulary list immediately after its definition.
    buildVocabList (vocab) ;

    /*
     * This function generates a composite CSS selector string.
     * This selector targets all elements that correspond to the defined vocabulary tokens,
     * enabling unified styling and event handling across the application.
     * It's used for elements in the main CSS panel and the sidebar vocabulary list.
     */
    function buildSelectors (obj) {
        // Extract all 'tokenName' values from the vocabulary array using jQuery's map.
        var selectors = $.map (vocab , function (val) {
            return val . tokenName ;
        }) . join (', .') ; // Combine them into a single string, separated by ', .' for multiple class selectors.

        // Prepend a '.' to the result to make it a valid class selector string.
        return '.' + selectors ;
    }

    // Store the generated comprehensive selector string in a variable for later use.
    var selectors = buildSelectors (vocab) ;

    // Utility function to extract meaningful CSS token classes from an element's 'className' property.
    // It removes transient classes like 'hover', 'hilite', and 'selected' before returning the core tokens.
    function getTokens (element) {
        var className = element . className ; // Get the full class string.
        var tokens = className . replace ('hover' , '') . replace ('hilite' , '') . replace ('selected' , '') . replace ('  ' , '') . trim () ; // Clean up.
        return tokens . split (' ') ; // Split the cleaned string into an array of individual token classes.
    }

    // Function to apply a 'hilite' class to elements corresponding to the given array of tokens.
    // This visually highlights related elements in both the CSS display area and the sidebar list.
    function hiliteTokens (tokens) {
        // Construct a jQuery selector for tokens within the '.css' panel.
        var cssPals = '.css .' + tokens . join ('.') ;
        // Construct a jQuery selector for tokens within the '.vocabList' sidebar.
        var vocabPals = '.vocabList .' + tokens . join (', .vocabList .') ;

        // First, remove the 'hilite' class from any currently highlighted elements.
        $('.hilite') . removeClass ('hilite') ;
        // Then, add the 'hilite' class to the matching elements in the CSS panel.
        $(cssPals) . addClass ('hilite') ;
        // And similarly, add the 'hilite' class to matching elements in the vocabulary list.
        $(vocabPals) . addClass ('hilite') ;
    }

    // Function to handle highlighting based on the current URL hash fragment.
    // If a hash exists, it parses it into tokens and applies highlighting.
    function hiliteHash () {
        var hash = location . hash ; // Retrieve the current URL hash.
        var tokens ; // Declare a variable to hold extracted tokens.

        // Check if the hash is not empty.
        if (hash) {
            // Remove the leading '#' character and split the remaining string by '+' to get individual tokens.
            tokens = hash . substr (1) . split ('+') ;
        }
        // If tokens were successfully extracted from the hash, proceed to highlight them.
        if (tokens) {
            hiliteTokens (tokens) ;
        }
    }

    // Execute the initial hash-based highlighting when the script first runs.
    hiliteHash () ;

    // Attach an event listener to the window for 'hashchange' events.
    // This ensures that the highlighting dynamically updates whenever the URL hash changes.
    $(window) . on ('hashchange' , function () {
        hiliteHash () ; // Re-invoke the highlighting logic.
    }) ;

    // Attach 'focus' and 'click' event handlers to all elements matching the generated selectors.
    // These handlers manage UI state (focus, selection) and URL hash updates.
    $(selectors) . on ('focus click' , function (event) {
        var tokens = getTokens (this) ; // Get the relevant tokens from the element that triggered the event.

        event . stopPropagation () ; // Prevent the event from propagating further up the DOM tree.

        // Find the closest parent '.content' or '.sidebar', add a 'focus' class to it,
        // and remove the 'focus' class from its siblings.
        $(this) . closest ('.content, .sidebar') . addClass ('focus')
            . siblings () . removeClass ('focus') ;

        // Remove the 'selected' class from any currently selected elements.
        $('.selected') . removeClass ('selected') ;
        // Add the 'selected' class to the element that triggered the event.
        $(this) . addClass ('selected') ;

        // Update the URL's hash fragment with the combined tokens.
        location . hash = '#' + tokens . join ('+') ;

        // If the browser does not natively support 'onhashchange', manually trigger the event
        // to ensure dependent logic (like hiliteHash) is executed.
        if (!supportsHashChange) {
            $(window) . trigger ('hashchange') ;
        }
    }) ;

    // Set the 'tabindex' attribute to '0' for all elements matching the selectors.
    // This makes them focusable via keyboard navigation.
    $(selectors) . attr ('tabindex' , '0') ;
    // The following line is a commented-out example of how to initially focus a specific element.
    // $('.vocabList .property').focus();

    // Implement keyboard navigation for the vocabulary list using the 'key' library.
    // Handler for the 'up' arrow key.
    key ('up' , function (event) {
        var vocabFocus = $('.vocabList :focus') ; // Identify the currently focused item in the vocab list.
        if (vocabFocus . length > 0) { // If an item is focused.
            event . preventDefault () ; // Prevent default browser scrolling.
            vocabFocus . prev () . focus () ; // Shift focus to the previous sibling element.
        }
    }) ;

    // Handler for the 'down' arrow key.
    key ('down' , function (event) {
        var vocabFocus = $('.vocabList :focus') ; // Identify the currently focused item in the vocab list.
        if (vocabFocus . length > 0) { // If an item is focused.
            event . preventDefault () ; // Prevent default browser scrolling.
            vocabFocus . next () . focus () ; // Shift focus to the next sibling element.
        }
    }) ;

    // Attach an event handler to the sidebar hide button.
    $('.sidebar-hide-btn') . on ('click touchstart' , function (event) {
        event . preventDefault () ; // Prevent default button behavior.
        $('body') . addClass ('sidebar-hide') ; // Add a class to the body to hide the sidebar.
    }) ;

    // Attach an event handler to the sidebar show button.
    $('.sidebar-show-btn') . on ('click touchstart' , function (event) {
        event . preventDefault () ; // Prevent default button behavior.
        $('body') . removeClass ('sidebar-hide') ; // Remove the class from the body to show the sidebar.
    }) ;

}); // End of the jQuery document ready function.