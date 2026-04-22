/*
 * This file contains JavaScript code for responsive tabs functionality.
 * It is designed to work with jQuery and Bootstrap.
 * Author: Fake Waffle Inc.
 * Date: 2023-10-27
 */

var fakewaffle = ( function ( $, fakewaffle ) {
    'use strict'; // Enforce strict mode for cleaner code.

    /**
     * Initializes responsive tabs functionality.
     * Converts Bootstrap tabs to accordions on smaller screens.
     * @param {Array} collapseDisplayed - An array of Bootstrap breakpoints (e.g., 'xs', 'sm')
     *                                    where tabs should collapse into accordions.
     */
    fakewaffle.responsiveTabs = function ( collapseDisplayed ) {

        // Set the initial position tracker for resize checks.
        fakewaffle.currentPosition = 'tabs';

        // Select all responsive tab groups.
        var tabGroups = $( '.nav-tabs.responsive' );
        var hidden    = ''; // String to store Bootstrap hidden classes.
        var visible   = ''; // String to store Bootstrap visible classes.
        var activeTab = ''; // Stores the ID of the currently active tab.

        // If collapseDisplayed is not provided, default to 'xs' and 'sm'.
        if ( collapseDisplayed === undefined ) {
            collapseDisplayed = [ 'xs', 'sm' ];
        }

        // Build the hidden and visible class strings based on breakpoints.
        $.each( collapseDisplayed, function () {
            hidden  += ' hidden-' + this;
            visible += ' visible-' + this;
        } );

        // Iterate over each responsive tab group found.
        $.each( tabGroups, function () {
            var $tabGroup   = $( this ); // Current tab group jQuery object.
            var tabs        = $tabGroup.find( 'li a' ); // All tab links within this group.
            /* Create a new div element to serve as the accordion container.
             * This will hold the collapsed panel structure.
             */
            var collapseDiv = $( '<div></div>', {
                'class' : 'panel-group responsive' + visible, // Add responsive visibility classes.
                'id'    : 'collapse-' + $tabGroup.attr( 'id' ) // Generate a unique ID for the accordion group.
            } );

            // Process each tab link to create its corresponding accordion panel.
            $.each( tabs, function () {
                var $this          = $( this ); // Current tab link jQuery object.
                // Get existing class, or empty string if none.
                var oldLinkClass   = $this.attr( 'class' ) === undefined ? '' : $this.attr( 'class' );
                var newLinkClass   = 'accordion-toggle'; // Base class for accordion header link.
                // Get parent's existing class, or empty string if none.
                var oldParentClass = $this.parent().attr( 'class' ) === undefined ? '' : $this.parent().attr( 'class' );
                var newParentClass = 'panel panel-default'; // Base class for accordion panel.
                // Transform tab hash to collapse ID.
                var newHash        = $this.get( 0 ).hash.replace( '#', 'collapse-' );

                // Append old link classes if they exist.
                if ( oldLinkClass.length > 0 ) {
                    newLinkClass += ' ' + oldLinkClass;
                }

                // Process parent classes, removing 'active' and cleaning up spaces.
                if ( oldParentClass.length > 0 ) {
                    oldParentClass = oldParentClass.replace( /\bactive\b/g, '' ); // Remove 'active' class.
                    newParentClass += ' ' + oldParentClass;                      // Append remaining classes.
                    newParentClass = newParentClass.replace( /\s{2,}/g, ' ' );    // Collapse multiple spaces.
                    newParentClass = newParentClass.replace( /^\s+|\s+$/g, '' );  // Trim leading/trailing spaces.
                }

                // If this tab is initially active, store its collapse ID.
                if ( $this.parent().hasClass( 'active' ) ) {
                    activeTab = '#' + newHash;
                }

                /* Build the accordion panel structure:
                 * <div class="panel panel-default">
                 *   <div class="panel-heading">
                 *     <h4 class="panel-title">
                 *       <a class="accordion-toggle" data-toggle="collapse" data-parent="..." href="...">...</a>
                 *     </h4>
                 *   </div>
                 *   <div id="..." class="panel-collapse collapse"></div>
                 * </div>
                 */
                collapseDiv.append(
                    $( '<div>' ).attr( 'class', newParentClass ).html(
                        $( '<div>' ).attr( 'class', 'panel-heading' ).html(
                            $( '<h4>' ).attr( 'class', 'panel-title' ).html(
                                $( '<a>', {
                                    'class'       : newLinkClass,
                                    'data-toggle' : 'collapse',
                                    'data-parent' : '#collapse-' + $tabGroup.attr( 'id' ),
                                    'href'        : '#' + newHash,
                                    'html'        : $this.html()
                                } )
                            )
                        )
                    ).append(
                        $( '<div>', {
                            'id'    : newHash,
                            'class' : 'panel-collapse collapse'
                        } )
                    )
                );
            } ); // End of $.each(tabs)

            // Insert the newly created accordion group after the tab group.
            $tabGroup.next().after( collapseDiv );
            // Hide the original tab navigation.
            $tabGroup.addClass( hidden );
            // Hide the original tab content panes.
            $( '.tab-content.responsive' ).addClass( hidden );
        } ); // End of $.each(tabGroups)

        // Perform an initial resize check to determine current display state.
        fakewaffle.checkResize();
        // Bind event handlers for tab and collapse toggling.
        fakewaffle.bindTabToCollapse();

        // If an active tab was found, show its corresponding accordion panel.
        if ( activeTab ) {
            $( activeTab ).collapse( 'show' );
        }
    }; // End of fakewaffle.responsiveTabs

    /**
     * Checks the window size and switches between tab and panel views as needed.
     */
    fakewaffle.checkResize = function () {
        // If panels are visible and current state is tabs, switch to panels.
        if ( $( '.panel-group.responsive' ).is( ':visible' ) === true && fakewaffle.currentPosition === 'tabs' ) {
            fakewaffle.tabToPanel();
            fakewaffle.currentPosition = 'panel';
        }
        // If panels are hidden and current state is panels, switch to tabs.
        else if ( $( '.panel-group.responsive' ).is( ':visible' ) === false && fakewaffle.currentPosition === 'panel' ) {
            fakewaffle.panelToTab();
            fakewaffle.currentPosition = 'tabs';
        }
    }; // End of fakewaffle.checkResize

    /**
     * Moves content from tab panes to corresponding accordion panel bodies.
     */
    fakewaffle.tabToPanel = function () {

        var tabGroups = $( '.nav-tabs.responsive' );

        $.each( tabGroups, function ( index, tabGroup ) {

            // Find the tab content panes associated with this tab group.
            var tabContents = $( tabGroup ).next( '.tab-content' ).find( '.tab-pane' );

            $.each( tabContents, function ( index, tabContent ) {
                // Determine the target accordion panel body ID.
                var destinationId = $( tabContent ).attr( 'id' ).replace ( /^/, '#collapse-' );

                // Convert tab pane to panel body and move its content.
                $( tabContent )
                    .removeClass( 'tab-pane' ) // Remove tab-pane class.
                    .addClass( 'panel-body' )  // Add panel-body class.
                    .appendTo( $( destinationId ) ); // Move to accordion panel.

            } ); // End of inner $.each

        } ); // End of outer $.each

    }; // End of fakewaffle.tabToPanel

    /**
     * Moves content from accordion panel bodies back to corresponding tab panes.
     */
    fakewaffle.panelToTab = function () {

        var panelGroups = $( '.panel-group.responsive' );

        $.each( panelGroups, function ( index, panelGroup ) {

            // Determine the target tab content element's ID.
            var destinationId = $( panelGroup ).attr( 'id' ).replace( 'collapse-', '#' );
            // Get the actual tab content element.
            var destination   = $( destinationId ).next( '.tab-content' )[ 0 ];

            // Find all panel bodies within this accordion group.
            var panelContents = $( panelGroup ).find( '.panel-body' );

            // Convert panel body back to tab pane and move its content.
            panelContents
                .removeClass( 'panel-body' ) // Remove panel-body class.
                .addClass( 'tab-pane' )      // Add tab-pane class.
                .appendTo( $( destination ) ); // Move back to tab content.

        } ); // End of $.each

    }; // End of fakewaffle.panelToTab

    /**
     * Binds events to synchronize tab and collapse toggling.
     */
    fakewaffle.bindTabToCollapse = function () {

        var tabs     = $( '.nav-tabs.responsive' ).find( 'li a' ); // All responsive tab links.
        var collapse = $( '.panel-group.responsive' ).find( '.panel-collapse' ); // All responsive collapse panels.

        // Event handler for when a Bootstrap tab is shown.
        tabs.on( 'shown.bs.tab', function ( e ) {
            // Target the corresponding collapse panel.
            var $current  = $( e.currentTarget.hash.replace( /#/, '#collapse-' ) );
            $current.collapse( 'show' ); // Show the collapse panel.

            // If there was a previously active tab, hide its collapse panel.
            if ( e.relatedTarget ) {
                var $previous = $( e.relatedTarget.hash.replace( /#/, '#collapse-' ) );
                $previous.collapse( 'hide' ); // Hide the previous collapse panel.
            }
        } );

        // Event handler for when a Bootstrap collapse panel is shown.
        collapse.on( 'shown.bs.collapse', function ( e ) {

            // Activate the corresponding tab.
            var current = $( e.target ).context.id.replace( /collapse-/g, '#' );
            $( 'a[href="' + current + '"]' ).tab( 'show' );

            // Update the 'active' class on the panel body (if applicable).
            var panelGroup = $( e.currentTarget ).closest( '.panel-group.responsive' );
            $( panelGroup ).find( '.panel-body' ).removeClass( 'active' ); // Remove active from all siblings.
            $( e.currentTarget ).find( '.panel-body' ).addClass( 'active' ); // Add active to current.

        } );
    }; // End of fakewaffle.bindTabToCollapse

    // Bind the checkResize function to the window's resize event.
    $( window ).resize( function () {
        fakewaffle.checkResize();
    } );

    // Return the fakewaffle object to extend it.
    return fakewaffle;

// Immediately-invoked function expression (IIFE) parameters.
}( window.jQuery, fakewaffle || { } ) ); // Pass jQuery and existing fakewaffle object, or a new empty object.