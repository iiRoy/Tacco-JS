( function ($ ) {

    /*
     * This section defines the plugin's default configuration options.
     * These can be overridden by the user when initializing the plugin.
     */
    var settings = {
        combine         : true,          /* Consolidate multiple navigation menus into a single <select> element. */
        groupPageText   : 'Main',        /* Text for the default option within an <optgroup> that represents the parent page. */
        nested          : true,          /* Determines if nested lists should be rendered as <optgroup> elements. */
        prependTo       : 'body',        /* Specifies where the generated <select> element should be inserted in the DOM. */
        switchWidth     : 480,           /* The viewport width threshold (in pixels) at which the menu switches between mobile and desktop views. */
        topOptionText   : 'Select a page'/* The placeholder text for the initial, unselected option in the <select> menu. */
    };

    // Store the jQuery collection of original matched menus.
    var $menus;

    // A counter to ensure unique IDs for generated <select> elements,
    // especially when no original ID is available.
    var menuCount = 0;

    // An array to keep track of unique links processed,
    // primarily used during the combination of multiple lists.
    var uniqueLinks = [ ];


    /*
     * Function: goTo
     * Description: Navigates the browser to the specified URL.
     * Parameters:
     *   url (string): The URL to navigate to.
     */
    function goTo ( url ) {
        document.location.href = url;
    }

    /*
     * Function: menuExists
     * Description: Checks if any mobile navigation menus (with class 'mnav') are present in the DOM.
     * Returns:
     *   boolean: true if at least one mobile menu exists, false otherwise.
     */
    function menuExists ( ) {
        return ( $( '.mnav' ).length ) ? true : false;
    }

    /*
     * Function: isList
     * Description: Validates if the given jQuery object consists solely of <ul> or <ol> elements.
     * Parameters:
     *   $this (jQuery object): The collection of elements to validate.
     * Returns:
     *   boolean: true if all elements are lists, false if any are not.
     */
    function isList ( $this ) {
        var pass = true;
        $this.each ( function ( ) {
            if ( !$( this ).is ( 'ul' ) && !$( this ).is ( 'ol' ) ) {
                pass = false;
            }
        } );
        return pass;
    } // End of isList function.


    /*
     * Function: isMobile
     * Description: Determines if the current viewport width is below the configured switchWidth.
     * Returns:
     *   boolean: true if the viewport is considered 'mobile', false otherwise.
     */
    function isMobile ( ) {
        return ( $( window ).width ( ) < settings.switchWidth );
    }


    /*
     * Function: getText
     * Description: Extracts the text content of a jQuery element, excluding the text of its child <ul> or <ol> elements.
     * Parameters:
     *   $item (jQuery object): The element from which to extract text.
     * Returns:
     *   string: The trimmed text content of the element.
     */
    function getText ( $item ) {
        return $.trim ( $item.clone ( ).children ( 'ul, ol' ).remove ( ).end ( ).text ( ) );
    }

    /*
     * Function: isUrlUnique
     * Description: Checks if a given URL is already present in the uniqueLinks array.
     * Parameters:
     *   url (string): The URL to check for uniqueness.
     * Returns:
     *   boolean: true if the URL is not found in uniqueLinks, false if it is.
     */
    function isUrlUnique ( url ) {
        return ( $.inArray ( url, uniqueLinks ) === -1 ) ? true : false;
    }


    /*
     * Function: checkForDuplicates
     * Description: Processes a list to remove duplicate list items based on their links and ensures
     *              nested items are correctly handled or removed if their parents are duplicates.
     * Parameters:
     *   $menu (jQuery object): The list (<ul> or <ol>) to check for and remove duplicates.
     */
    function checkForDuplicates ( $menu ) {

        $menu.find ( ' > li' ).each ( function ( ) {

            var $li = $( this );
            var link = $li.find ( 'a' ).attr ( 'href' );

            var parentLink = function ( ) {
                if ( $li.parent ( ).parent ( ).is ( 'li' ) ) {
                    return $li.parent ( ).parent ( ).find ( 'a' ).attr ( 'href' );
                } else {
                    return null;
                }
            };

            // Recursively check nested lists for duplicates first.
            if ( $li.find ( ' ul, ol' ).length ) {
                checkForDuplicates ( $li.find ( '> ul, > ol' ) );
            }

            // Remove any empty ULs/OLs that might have resulted from child LI removals.
            if ( !$li.find ( ' > ul li, > ol li' ).length ) {
                $li.find ( 'ul, ol' ).remove ( );
            }

            // If the parent <li> has a link and it's not unique,
            // and the current <li>'s link *is* unique, append the current <li>
            // to the unique parent's sub-list.
            if ( !isUrlUnique ( parentLink ( ), uniqueLinks ) && isUrlUnique ( link, uniqueLinks ) ) {
                $li.appendTo (
                    $menu.closest ( 'ul#mmnav' ).find ( 'li:has(a[href=' + parentLink ( ) + ']):first ul' )
                );
            }

            // If the current <li>'s link is unique, add it to the uniqueLinks tracking array.
            else if ( isUrlUnique ( link ) ) {
                uniqueLinks.push ( link );
            }

            // Otherwise, if the link is a duplicate, remove the list item entirely.
            else {
                $li.remove ( );
            }

        } );
    }


    /*
     * Function: combineLists
     * Description: Merges all initially matched navigation menus into a single new <ul> element,
     *              then de-duplicates the combined list.
     * Returns:
     *   jQuery object: The newly created, combined, and de-duplicated <ul> element.
     */
    function combineLists ( ) {

        // Create a new, empty list element to hold combined items.
        var $menu = $( '<ul id="mmnav" />' );

        // Iterate through each of the original menus and append their children to the new list.
        $menus.each ( function ( ) {
            $( this ).children ( ).clone ( ).appendTo ( $menu );
        } );

        // Perform duplicate checking and removal on the combined list.
        checkForDuplicates ( $menu );

        // Return the final combined menu.
        return $menu;

    } // End of combineLists function.


    /*
     * Function: createOption
     * Description: Generates an <option> element and appends it to a specified container.
     * Parameters:
     *   $item (jQuery object): The list item (<li>) from which to derive the option's value and text.
     *   $container (jQuery object): The <select> or <optgroup> element to which the option will be appended.
     *   text (string, optional): Custom text for the option. If not provided, the text is extracted from $item.
     */
    function createOption ( $item, $container, text ) {

        // If no custom text is provided, use the item's text. Otherwise, use the provided text.
        if ( !text ) {
            $( '<option value="' + $item.find ( 'a:first' ).attr ( 'href' ) + '">' + $.trim ( getText ( $item ) ) + '</option>' ).appendTo ( $container );
        } else {
            $( '<option value="' + $item.find ( 'a:first' ).attr ( 'href' ) + '">' + text + '</option>' ).appendTo ( $container );
        }

    } // End of createOption function.


    /*
     * Function: createOptionGroup
     * Description: Creates an <optgroup> element for nested navigation items and populates it with options.
     * Parameters:
     *   $group (jQuery object): The list item (<li>) that serves as the parent for the optgroup.
     *   $container (jQuery object): The <select> element to which the optgroup will be appended.
     */
    function createOptionGroup ( $group, $container ) {

        // Construct a new <optgroup> with the label derived from the parent list item's text.
        var $optgroup = $( '<optgroup label="' + $.trim ( getText ( $group ) ) + '" />' );

        // Add a default option to the optgroup, linking back to the parent page.
        createOption ( $group, $optgroup, settings.groupPageText );

        // Iterate through each sub-list (<ul> or <ol>) within the parent item.
        $group.children ( 'ul, ol' ).each ( function ( ) {

            // For each list item in the sub-list, create and append an <option> to the optgroup.
            $( this ).children ( 'li' ).each ( function ( ) {
                createOption ( $( this ), $optgroup );
            } );
        } );

        // Finally, append the fully populated optgroup to the main select container.
        $optgroup.appendTo ( $container );

    } // End of createOptionGroup function.


    /*
     * Function: createSelect
     * Description: Generates a complete <select> HTML element based on a given menu structure,
     *              including options and optgroups as necessary.
     * Parameters:
     *   $menu (jQuery object): The <ul> or <ol> element from which to build the <select> menu.
     */
    function createSelect ( $menu ) {

        // Initialize a new <select> element with a unique ID and the 'mnav' class.
        var $select = $( '<select id="mm' + menuCount + '" class="mnav" />' );
        menuCount++; // Increment the counter for the next select element.

        // If a top-level option text is defined in settings, create and append it.
        if ( settings.topOptionText ) {
            createOption ( $( '<li>' + settings.topOptionText + '</li>' ), $select );
        }

        // Iterate through each top-level list item in the provided menu.
        $menu.children ( 'li' ).each ( function ( ) {

            var $li = $( this );

            // If nested navigation is enabled and the list item has sub-lists, create an optgroup.
            if ( $li.children ( 'ul, ol' ).length && settings.nested ) {
                createOptionGroup ( $li, $select );
            }

            // Otherwise, for single-level items or when nesting is disabled, create a simple option.
            else {
                createOption ( $li, $select );
            }

        } );

        // Attach a change event handler to the select menu to navigate on selection,
        // then prepend the entire select element to the specified location in the DOM.
        $select
            .change ( function ( ) {
                goTo ( $( this ).val ( ) );
            } )
            .prependTo ( settings.prependTo );

    } // End of createSelect function.


    /*
     * Function: runPlugin
     * Description: Core logic to determine whether to create, show, or hide the mobile navigation menu
     *              based on the current viewport width and existing menu state.
     */
    function runPlugin ( ) {

        // Scenario 1: Mobile width detected, and no mobile menu currently exists.
        if ( isMobile ( ) && !menuExists ( ) ) {

            // If combining menus is enabled, create a single <select> from all matched lists.
            if ( settings.combine ) {
                var $menu = combineLists ( );
                createSelect ( $menu );
            }

            // Otherwise, create a separate <select> for each individual matched list.
            else {
                $menus.each ( function ( ) {
                    createSelect ( $( this ) );
                } );
            }
        }

        // Scenario 2: Mobile width detected, and a mobile menu already exists.
        // In this case, ensure the mobile menu is visible and the original menus are hidden.
        if ( isMobile ( ) && menuExists ( ) ) {
            $( '.mnav' ).show ( );
            $menus.hide ( );
        }

        // Scenario 3: Not mobile width, and a mobile menu exists.
        // Hide the mobile menu and show the original navigation menus.
        if ( !isMobile ( ) && menuExists ( ) ) {
            $( '.mnav' ).hide ( );
            $menus.show ( );
        }

    } // End of runPlugin function.


    /*
     * Plugin Definition: $.fn.mobileMenu
     * Description: The main entry point for the jQuery plugin. Initializes the mobile menu functionality.
     * Parameters:
     *   options (object, optional): An object to override default settings.
     */
    $.fn.mobileMenu = function ( options ) {

        // Extend default settings with any user-provided options.
        if ( options ) {
            $.extend ( settings, options );
        }

        // Validate that the plugin is called on <ul> or <ol> elements.
        if ( isList ( $( this ) ) ) {
            $menus = $( this ); // Store the matched list elements.
            runPlugin ( );       // Execute the plugin logic immediately.
            // Attach a resize event listener to re-run the plugin logic whenever the window is resized.
            $( window ).resize ( function ( ) {
                runPlugin ( );
            } );
        } else {
            // Alert the user if the plugin is not applied to appropriate elements.
            alert ( 'mobileMenu only works with <ul>/<ol>' );
        }

    }; // End of mobileMenu plugin definition.

} ) ( jQuery ); // Immediately-invoked function expression (IIFE) to encapsulate the plugin.