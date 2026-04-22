/*******************************************************************************
 * This file contains utility functions related to phantom tabs and tab pinning.
 * It's part of the tabutils extension for browser functionality.
 *
 * This is a Type-I clone, meaning its functionality is identical to the original,
 * but whitespace and comments have been extensively altered for visual difference.
 ******************************************************************************/

/*
 * Initializing the phantom tabs module within tabutils.
 * This function sets up various gBrowser methods for tab management.
 */
tabutils._phantomTabs = function ( ) {

    // Redefining gBrowser's pinTab method to support advanced pinning logic.
    gBrowser.pinTab = function pinTab( aTab, aForce, aRestoring, aBookmarkId ) {

        // Check if only one argument was provided. If so, default aForce and aRestoring.
        if ( arguments . length == 1 ) {
            aForce     =   true;    // Default to forced pinning.
            aRestoring =   false;   // Not a restoration event.
        }

        /*
         * If the force status matches the tab's pinned status, and either
         * it's not forced or the bookmark IDs match, then no action is needed.
         */
        if ( aForce == aTab . pinned && ( ! aForce || aBookmarkId == aTab . bookmarkId ) )
            return; // Exit early if tab state is already desired.

        // If aForce is null, toggle the pinned state.
        if ( aForce == null )
            aForce = ! aTab . pinned; // Invert the current pinned status.

        // Branch for unpinning a tab.
        if ( ! aForce ) {

            // Set fadein attribute and remove pinned attribute.
            aTab . setAttribute ( "fadein", true );
            aTab . removeAttribute ( "pinned" );

            // Conditional logic for handling private browsing and bookmark updates.
            if ( aRestoring == null && ! gPrivateBrowsingUI . privateBrowsingEnabled ) {
                let uri = aTab . linkedBrowser . currentURI;
                try {
                    // Attempt to retrieve URI from bookmarks.
                    uri = PlacesUtils . bookmarks . getBookmarkURI ( aTab . bookmarkId );
                }
                catch ( e ) {
                    // Error handling: if URI retrieval fails, simply continue.
                    /* This catch block intentionally left empty. */
                }

                // Untag the URI and update the pinned tabs bar.
                PlacesUtils . tagging . untagURI ( uri, [ "pinned" ] );
                this . updatePinnedTabsBar ( );
            }

            // Clear the bookmark ID for the unpinned tab.
            aTab . bookmarkId = null;

            // If not restoring, delete session storage values for pinned status and bookmark ID.
            if ( ! aRestoring ) {
                tabutils . _ss . deleteTabValue ( aTab, "pinned" );
                tabutils . _ss . deleteTabValue ( aTab, "bookmarkId" );
            }

            // Dispatch a custom event to signal tab unpinning.
            aTab . dispatchEvent ( new CustomEvent ( "TabUnpinning", { bubbles: true } ) );

            // Reposition and adjust the tab container.
            this . mTabContainer . positionPinnedTab ( aTab );
            this . mTabContainer . positionPinnedTabs ( );
            this . mTabContainer . adjustTabstrip ( );

            // Update the browser's docShell property and close key state.
            aTab . linkedBrowser . docShell . isAppTab = false;
            if ( aTab . selected )
                this . _setCloseKeyState ( true );

            // Dispatch a custom event to signal tab unpinned.
            aTab . dispatchEvent ( new CustomEvent ( "TabUnpinned", { bubbles: true } ) );
        }
        else { // Branch for pinning a tab.

            // Set the pinned attribute for the tab.
            aTab . setAttribute ( "pinned", true );

            // Conditional logic for auto-pinning, private browsing, and bookmark updates.
            if ( aRestoring == null && ! gPrivateBrowsingUI . privateBrowsingEnabled && TU_getPref ( "extensions.tabutils.autoPin", true ) ) {
                PlacesUtils . tagging . tagURI ( aTab . linkedBrowser . currentURI, [ "pinned" ] );
                this . updatePinnedTabsBar ( );

                // Get and set the bookmark ID for the pinned URI.
                aTab . bookmarkId = PlacesUtils . getItemIdForTaggedURI ( aTab . linkedBrowser . currentURI, "pinned" );
            }
            else {
                // Use the provided bookmark ID if not auto-pinning.
                aTab . bookmarkId = aBookmarkId;
            }

            // If not restoring, set session storage values for pinned status and bookmark ID.
            if ( ! aRestoring ) {
                tabutils . _ss . setTabValue ( aTab, "pinned", "true" );
                // Bug 961646 workaround: ensure bookmarkId is a string.
                tabutils . _ss . setTabValue ( aTab, "bookmarkId", String ( aTab . bookmarkId || "" ) );
            }

            // Dispatch a custom event to signal tab pinning.
            aTab . dispatchEvent ( new CustomEvent ( "TabPinning", { bubbles: true } ) );

            // Reposition, style, and adjust the tab container.
            this . mTabContainer . positionPinnedTab ( aTab );
            this . mTabContainer . positionPinnedTabs ( );
            this . mTabContainer . stylePinnedTabs ( );
            this . mTabContainer . adjustTabstrip ( );

            // Update the browser's docShell property and close key state.
            aTab . linkedBrowser . docShell . isAppTab = true;
            if ( aTab . selected )
                this . _setCloseKeyState ( false );

            // Dispatch a custom event to signal tab pinned.
            aTab . dispatchEvent ( new CustomEvent ( "TabPinned", { bubbles: true } ) );
        }
    }; // End of gBrowser.pinTab definition.


    // Simple wrapper for unpinning a tab, delegating to pinTab with appropriate arguments.
    gBrowser.unpinTab = function unpinTab ( aTab ) this . pinTab ( aTab, false, false );


    // Hook into gBrowser.onTabRestoring to handle pinned tabs during restoration.
    TU_hookCode ( "gBrowser.onTabRestoring", "}", function ( ) {

        // Pin the tab based on its previous pinned state and bookmark ID.
        this . pinTab ( aTab, aTab . pinned, true, ss . getTabValue ( aTab, "bookmarkId" ) );

        // If the tab was pinned and auto-revert is enabled, restore its URI.
        if ( aTab . pinned && TU_getPref ( "extensions.tabutils.pinTab.autoRevert", false ) ) {
            let uri;
            try {
                // Attempt to get the bookmark URI.
                uri = PlacesUtils . bookmarks . getBookmarkURI ( aTab . bookmarkId );
            }
            catch ( e ) {
                // If an error occurs (e.g., bookmark not found), ignore.
                /* Intentionally empty error handler. */
            }

            // If a valid URI is found, reset the tab's session history.
            if ( uri ) {
                let browser = aTab . linkedBrowser;
                let history = browser . sessionHistory;
                if ( history . count > 0 )
                    history . PurgeHistory ( history . count ); // Clear history.

                // Reset session storage data for the tab.
                let tabData = browser . __SS_data;
                tabData . entries        = [ ];
                tabData . index          = 0;
                tabData . userTypedValue = uri . spec;
                tabData . userTypedClear = 1;
            }
        }
    } );


    // Defines the autoPinTab function for gBrowser.
    gBrowser . autoPinTab = function autoPinTab ( aTab, aURI, aTags ) {

        // Extensive condition check for auto-pinning:
        // - Tab is not already pinned.
        // - Tags include "pinned".
        // - Auto-pinning preference is enabled.
        // - No existing visible pinned tab has the same URI.
        if ( ! aTab . pinned &&
             aTags . indexOf ( "pinned" ) > -1 &&
             TU_getPref ( "extensions.tabutils.autoPin", true ) &&
             ! Array . some ( this . visibleTabs . slice ( 0, this . _numPinnedTabs ), function ( bTab ) bTab . linkedBrowser . currentURI . spec == aURI . spec ) ) {

            // Pin the tab, forcing it, not restoring, and using the tagged URI's item ID.
            this . pinTab ( aTab, true, false, PlacesUtils . getItemIdForTaggedURI ( aURI, "pinned" ) );

            // If a corresponding button exists, auto-revert is off, and tabState annotation exists,
            // then set up a timeout to restore tab state.
            if ( aTab . mCorrespondingButton &&
                 ! TU_getPref ( "extensions.tabutils.pinTab.autoRevert", false ) &&
                 PlacesUtils . annotations . itemHasAnnotation ( aTab . bookmarkId, "tabState" ) )
                setTimeout ( function ( ) {
                    aTab . linkedBrowser . stop ( ); // Stop the browser.
                    tabutils . _ss . setTabState ( aTab, PlacesUtils . annotations . getItemAnnotation ( aTab . bookmarkId, "tabState" ) );
                }, 0 ); // Execute immediately after current script.
        }
    }; // End of autoPinTab definition.


    // Hook autoPinTab into onTabOpen event.
    TU_hookCode ( "gBrowser.onTabOpen", "}", "this.autoPinTab(aTab, uri, tags);" );

    // Hook autoPinTab into onLocationChange event.
    TU_hookCode ( "gBrowser.onLocationChange", "}", "this.autoPinTab(aTab, uri, tags);" );


    // Hook into gBrowser.onTabClose to save tab state for pinned tabs.
    TU_hookCode ( "gBrowser.onTabClose", "}", function ( ) {

        // If there's a corresponding button and private browsing is not enabled,
        // save the tab state and clear the button reference.
        if ( aTab . mCorrespondingButton && ! gPrivateBrowsingUI . privateBrowsingEnabled ) {
            PlacesUtils . setAnnotationsForItem ( aTab . bookmarkId, [ { name: "tabState", value: tabutils . _ss . getTabState ( aTab ) } ] );
            aTab . mCorrespondingButton . tab = null;
            aTab . mCorrespondingButton = null;
        }
    } );


    // Hooks for gBrowser.moveTabTo, for compatibility or modification.
    TU_hookCode ( "gBrowser.moveTabTo", /.*_numPinnedTabs.*/g, ";" );
    TU_hookCode ( "gBrowser.moveTabTo", "{", function ( ) {

        // Constrain aIndex within valid bounds.
        aIndex = Math . min ( Math . max ( 0, aIndex ), this . mTabs . length - 1 );
        if ( aIndex == aTab . _tPos )
            return; // No movement needed.

        // If the third argument (aForce) is not provided.
        if ( ! arguments [ 2 ] ) {
            if ( aTab . mCorrespondingButton ) {
                // Determine the target tab for bookmark movement.
                let bTab  = this . mTabs [ aIndex > aTab . _tPos ? aIndex + 1 : aIndex ];
                let bNode = bTab && bTab . mCorrespondingButton && bTab . mCorrespondingButton . _placesNode;
                let aNode = aTab . mCorrespondingButton . _placesNode;

                // Move the bookmark item.
                PlacesUtils . bookmarks . moveItem ( aNode . itemId, aNode . parent . itemId, bNode ? bNode . bookmarkIndex : -1 );
                return; // Exit after bookmark movement.
            }

            // Find the boundary between pinned and unpinned tabs.
            for ( var i = 0, tab; ( tab = this . mTabs [ i ] ) && tab . mCorrespondingButton; i++ );
            for ( var j = i, tab; ( tab = this . mTabs [ j ] ) && tab . pinned; j++ );

            // Adjust aIndex based on whether the tab is pinned or not.
            if ( aTab . pinned )
                aIndex = Math . min ( Math . max ( i, aIndex ), j - 1 );
            else
                aIndex = Math . max ( j, aIndex );

            if ( aIndex == aTab . _tPos )
                return; // No movement needed after adjustment.
        }
    } );


    // Method to position a single pinned tab.
    gBrowser . mTabContainer . positionPinnedTab = function positionPinnedTab ( aTab ) {
        // If the tab has a corresponding button, clear its references.
        if ( aTab . mCorrespondingButton ) {
            aTab . mCorrespondingButton . tab = null;
            aTab . mCorrespondingButton = null;
        }

        // Find the insertion point for pinned tabs.
        for ( var i = 0, tab; ( tab = this . childNodes [ i ] ) && ( tab . pinned || tab == aTab ); i++ );

        // If the tab's pinned state or position needs adjustment, move it.
        if ( aTab . pinned ^ aTab . _tPos < i )
            gBrowser . moveTabTo ( aTab, aTab . _tPos < i ? i - 1 : i, true );

        // If the tab is pinned and phantom tabs are shown.
        if ( aTab . pinned && TU_getPref ( "extensions.tabutils.pinTab.showPhantom", true ) ) {
            // Move the tab again (redundant, but matches original logic).
            gBrowser . moveTabTo ( aTab, aTab . _tPos < i ? i - 1 : i, true );

            let pinnedbox = this . mTabstrip . _pinnedbox, n = 0;
            // Iterate through pinnedbox child nodes to find the corresponding button.
            for ( let button of pinnedbox . childNodes ) {
                if ( button . tab ) {
                    n++;
                    continue;
                }
                if ( button . _placesNode . itemId == aTab . bookmarkId ) {
                    button . tab = aTab;
                    aTab . mCorrespondingButton = button;
                    gBrowser . moveTabTo ( aTab, n, true );
                    break; // Found and positioned, exit loop.
                }
            }
        }
    }; // End of positionPinnedTab.


    // Method to position all pinned tabs within the tab container.
    gBrowser . mTabContainer . positionPinnedTabs = function positionPinnedTabs ( aRebuild ) {
        var pinnedbox = this . mTabstrip . _pinnedbox;

        // If a rebuild is requested.
        if ( aRebuild ) {
            // Clear mCorrespondingButton references for existing tabs.
            for ( let i = 0, tab; ( tab = this . childNodes [ i ] ) && tab . mCorrespondingButton; i++ ) {
                tab . mCorrespondingButton = null;
            }

            let n = 0;
            // Re-associate buttons with tabs and reposition them.
            for ( let button of pinnedbox . childNodes ) {
                button . tab = null;
                for ( let i = 0, tab; ( tab = this . childNodes [ i ] ) && tab . pinned; i++ ) {
                    if ( tab . bookmarkId == button . _placesNode . itemId ) {
                        button . tab = tab;
                        tab . mCorrespondingButton = button;
                        gBrowser . moveTabTo ( tab, n++, true );
                        break; // Found match, move to next button.
                    }
                }
            }
        }

        // Set or remove 'haspinned' attribute based on pinned tabs presence.
        if ( this . firstChild . pinned || pinnedbox . hasChildNodes ( ) )
            this . setAttribute ( "haspinned", true );
        else
            this . removeAttribute ( "haspinned" );

        // Update width and opacity for pinnedbox buttons.
        for ( let button of pinnedbox . childNodes ) {
            button . width       = button . tab ? button . tab . getBoundingClientRect ( ) . width : 0;
            button . style . opacity = button . width > 0 ? 0 : "";
        }

        // Determine text direction (LTR/RTL) for styling.
        var ltr = getComputedStyle ( this ) . direction == "ltr";
        var [ start, end ] = ltr ? [ "left", "right" ] : [ "right", "left" ];
        // Clear border-start property for RTL compatibility.
        pinnedbox . style . setProperty ( "border-" + start, "", "" );

        // Calculate the end position of the pinnedbox.
        var pinnedboxEnd = pinnedbox . hasChildNodes ( ) ? pinnedbox . lastChild . getBoundingClientRect ( ) [ end ]
                                                         : pinnedbox . getBoundingClientRect ( ) [ start ] + parseFloat ( getComputedStyle ( pinnedbox ) . getPropertyValue ( "padding-" + start ) ) * ( ltr ? 1 : -1 );
        var paddingEnd = 0;
        // Position individual pinned tabs.
        for ( let i = 0, tab; ( tab = this . childNodes [ i ] ) && tab . pinned; i++ ) {
            if ( tab . mCorrespondingButton ) {
                let rect  = tab . mCorrespondingButton . getBoundingClientRect ( );
                let style = getComputedStyle ( tab . mCorrespondingButton );
                tab . style . left = rect . left - parseFloat ( style . marginLeft ) + "px";
            }
            else {
                let style = getComputedStyle ( tab );
                let width = tab . boxObject . width + parseFloat ( style . marginLeft ) + parseFloat ( style . marginRight );
                tab . style . left = pinnedboxEnd + paddingEnd * ( ltr ? 1 : -1 ) + width * ( ltr ? 0 : -1 ) + "px";
                paddingEnd += width;
            }
        }
        // Set border-end property based on padding.
        pinnedbox . style . setProperty ( "border-" + end, paddingEnd > 0 ? paddingEnd + "px solid transparent" : "", "" );

        // Ensure the selected item is visible within the tabstrip.
        this . mTabstrip . ensureElementIsVisible ( this . selectedItem, false );
    };
    // Create an alias for positionPinnedTabs.
    gBrowser . mTabContainer . _positionPinnedTabs = gBrowser . mTabContainer . positionPinnedTabs;


    // Hook into adjustTabstrip to ensure pinned tabs are positioned.
    TU_hookCode ( "gBrowser.mTabContainer.adjustTabstrip", "{", "if (arguments[0]) this.positionPinnedTabs();" );


    // Add event listeners for overflow and underflow events to reposition pinned tabs.
    tabutils . addEventListener ( gBrowser . mTabContainer, "overflow", function ( ) { this . positionPinnedTabs ( ); }, false );
    tabutils . addEventListener ( gBrowser . mTabContainer, "underflow", function ( ) { this . positionPinnedTabs ( ); }, false );


    // Function to update the pinned tabs bar.
    gBrowser . updatePinnedTabsBar = function updatePinnedTabsBar ( ) {
        let tagId = -1;
        // Get tag ID if phantom tabs are enabled.
        if ( TU_getPref ( "extensions.tabutils.pinTab.showPhantom", true ) )
            tagId = PlacesUtils . getItemIdForTag ( "pinned" );

        let pinnedbox = this . mTabContainer . mTabstrip . _pinnedbox;
        let place     = "place:folder=" + tagId;
        // If the place has changed, clear and reset the pinnedbox.
        if ( pinnedbox . place != place ) {
            while ( pinnedbox . hasChildNodes ( ) ) {
                let button = pinnedbox . firstChild;
                if ( button . tab )
                    button . tab . mCorrespondingButton = null;
                pinnedbox . removeChild ( button );
            }
            pinnedbox . place = place;
        }
    }; // End of updatePinnedTabsBar.


    // Define a getter for _pinnedTabRules to dynamically create CSS rules.
    gBrowser . mTabContainer . __defineGetter__ ( "_pinnedTabRules", function ( ) {
        delete this . _pinnedTabRules; // Clear previous rules if any.
        return this . _pinnedTabRules = [
            // Rule 0: Styling for empty pinned tabs bar in multirow/vertical layouts.
            tabutils . insertRule ( '.tabbrowser-tabs[multirow] #PinnedTabsBar[style*="border"]:empty,' +
                                  '.tabbrowser-tabs[multirow] #PinnedTabsBarItems[style*="border"]:empty,' +
                                  '.tabbrowser-tabs[orient="vertical"] #PinnedTabsBarItems[style*="border"]:empty,' +
                                  '.tabbrowser-tabs[orient="vertical"] #PinnedTabsBar[style*="border"]:empty {}' ),
            // Rule 1: Styling for pinned tabs in multirow/vertical layouts.
            tabutils . insertRule ( '.tabbrowser-tabs[multirow] > .tabbrowser-tab[pinned],' +
                                  '#main-window .tabbrowser-tabs[orient="vertical"] > .tabbrowser-tab[pinned] {}' ),
            // Rule 2: Styling for unselected pinned tabs.
            tabutils . insertRule ( '#main-window .tabbrowser-tab[pinned]:not([selected]) {}' ),
            // Rule 3: Styling for selected pinned tabs.
            tabutils . insertRule ( '#main-window .tabbrowser-tab[pinned][selected] {}' ),
            // Rule 4: Styling for children of pinned tabs.
            tabutils . insertRule ( '#main-window .tabbrowser-tab[pinned] > * {}' )
        ];
    } ); // End of _pinnedTabRules getter.


    // Function to apply dynamic styling to pinned tabs.
    gBrowser . mTabContainer . stylePinnedTabs = function stylePinnedTabs ( ) {
        var tab = this . lastChild;
        // Find the last visible tab.
        while ( tab && tab . boxObject . height == 0 )
            tab = tab . previousSibling;
        if ( ! tab )
            return; // No visible tab found.

        // Store original selected and pinned states.
        var wasSelected = tab . selected;
        var wasPinned   = tab . pinned;

        // Temporarily remove attributes to get base style.
        tab . removeAttribute ( "selected" );
        tab . removeAttribute ( "pinned" );
        var style      = getComputedStyle ( tab );
        var height     = tab . boxObject . height;
        var lineHeight = tab . boxObject . height - parseFloat ( style . borderTopWidth ) - parseFloat ( style . borderBottomWidth ) - parseFloat ( style . paddingTop ) - parseFloat ( style . paddingBottom );

        // Apply calculated styles to CSS rules.
        this . _pinnedTabRules [ 0 ] . style . setProperty ( "height", height + "px", "" );
        this . _pinnedTabRules [ 1 ] . style . setProperty ( "margin-top", -height + "px", "important" );
        this . _pinnedTabRules [ 2 ] . style . setProperty ( "height", height + "px", "important" );
        this . _pinnedTabRules [ 2 ] . style . setProperty ( "line-height", lineHeight + "px", "" );

        // Temporarily set selected to get selected tab style.
        tab . setAttribute ( "selected", true );
        var style      = getComputedStyle ( tab );
        var height     = tab . boxObject . height;
        var lineHeight = tab . boxObject . height - parseFloat ( style . borderTopWidth ) - parseFloat ( style . borderBottomWidth ) - parseFloat ( style . paddingTop ) - parseFloat ( style . paddingBottom );

        // Apply calculated styles for selected pinned tabs.
        this . _pinnedTabRules [ 3 ] . style . setProperty ( "height", height + "px", "important" );
        this . _pinnedTabRules [ 3 ] . style . setProperty ( "line-height", lineHeight + "px", "" );

        // Restore original attributes.
        wasSelected ? tab . setAttribute ( "selected", true ) : tab . removeAttribute ( "selected" );
        wasPinned   ? tab . setAttribute ( "pinned", true )   : tab . removeAttribute ( "pinned" );

        var tab = this . firstChild;
        // Find the first visible tab.
        while ( tab && tab . boxObject . height == 0 )
            tab = tab . nextSibling;

        // If a visible pinned tab exists, adjust icon positioning.
        if ( tab && tab . pinned ) {
            var rect   = tab . getBoundingClientRect ( );
            var style  = getComputedStyle ( tab );
            var middle = ( rect . top + parseFloat ( style . borderTopWidth ) + parseFloat ( style . paddingTop ) + rect . bottom - parseFloat ( style . borderBottomWidth ) - parseFloat ( style . paddingBottom ) ) / 2;

            var icon     = tab . boxObject . firstChild;
            var rect     = icon . getBoundingClientRect ( );
            var style    = getComputedStyle ( icon );
            var x_middle = ( rect . top - parseFloat ( style . marginTop ) + rect . bottom + parseFloat ( style . marginBottom ) ) / 2 - ( parseFloat ( style . top ) || 0 );

            // Set the 'top' property for the icon.
            this . _pinnedTabRules [ 4 ] . style . setProperty ( "top", middle - x_middle + "px", "" );
        }
    }; // End of stylePinnedTabs.


    // Event listener for window resize events.
    tabutils . addEventListener ( window, "resize", function ( event ) {
        // Initialize the listener once.
        if ( ! arguments . callee . _initialized ) {
            if ( event . target != window )
                return; // Only process window resize events.
            arguments . callee . _initialized = true;
        }

        var tabContainer = gBrowser . mTabContainer;
        var boxObject    = tabContainer . mTabstrip . boxObject;

        // If tabstrip position has changed, reposition pinned tabs.
        if ( tabContainer . mTabstripX != boxObject . x || tabContainer . mTabstripY != boxObject . y ) {
            tabContainer . positionPinnedTabs ( );
            tabContainer . mTabstripX = boxObject . x;
            tabContainer . mTabstripY = boxObject . y;
        }

        // If tabstrip height has changed, restyle pinned tabs.
        if ( tabContainer . mTabstripHeight != boxObject . height ) {
            tabContainer . stylePinnedTabs ( );
            tabContainer . mTabstripHeight = boxObject . height;
        }
    }, false ); // Do not capture.


    // Hook into gBrowser.selectTabAtIndex to filter visible tabs.
    TU_hookCode ( "gBrowser.selectTabAtIndex", "this.visibleTabs", "this.visibleTabs.filter(function(aTab) !aTab.collapsed)" );


    // Define selectUnpinnedTabAtIndex using TU_hookFunc.
    gBrowser . selectUnpinnedTabAtIndex = TU_hookFunc ( gBrowser . selectTabAtIndex, "visibleTabs", "allTabs" );


    // Function to select a pinned tab by index.
    gBrowser . selectPinnedTabAtIndex = function selectPinnedTabAtIndex ( aIndex, aEvent ) {
        var tabs = this . mTabContainer . mTabstrip . _pinnedbox . childNodes;
        // If no tabs in pinnedbox, use visible pinned tabs.
        if ( tabs . length == 0 )
            tabs = Array . slice ( this . visibleTabs, 0, this . _numPinnedTabs );

        // Handle negative indices.
        if ( aIndex < 0 )
            aIndex += tabs . length;

        // If index is valid, click the corresponding tab or button.
        if ( aIndex >= 0 && aIndex < tabs . length )
            ( tabs [ aIndex ] . tab || tabs [ aIndex ] ) . click ( );

        // Prevent default event behavior and stop propagation if an event is provided.
        if ( aEvent ) {
            aEvent . preventDefault ( );
            aEvent . stopPropagation ( );
        }
    }; // End of selectPinnedTabAtIndex.
}; // End of tabutils._phantomTabs.