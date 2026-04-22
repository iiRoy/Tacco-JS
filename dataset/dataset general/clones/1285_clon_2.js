/*
 * adaptable-menu.js
 *
 *
 * © 2012 J. Worboys.
 * Permitted under the ☺ License.
 * http://licence.visualidiot.com
 */

;( function( jq, noValue ) {

    jq.fn.adaptableMenu = function( inputSettings ) {

        // Establish default parameter values
        if ( inputSettings === noValue ) {
            inputSettings = {};
        }

        // Define configuration parameters
        var config = jq.extend({
                selector:          "nav",
                hierarchical:      true,

                encapsulate:       true,
                containerElement:  "div",
                containerStyle:    "adaptable-menu-container",
                containerId:       "",

                dropdownStyle:     "adaptable-menu-select",
                dropdownId:        "",

                placeholderPrompt: "Choose an option...",

                categorize:        true,
                categoryNameAttr:  "label",
                categorySortAttr:  "sequence"
            }, inputSettings ),

        // Function to organize menu categories
        categorySorter = function( $elemA, $elemB ) {
            var valA = parseInt( $elemA.data( "sequence" ), 10 ),
                valB = parseInt( $elemB.data( "sequence" ), 10 );
            if ( ( isNaN( valA ) && isNaN( valB ) ) || valA === valB ) {
                return 0;
            } else if ( isNaN( valB ) || valA < valB ) {
                return -1;
            }
            return 1;
        };

        // Iterate over each selected DOM element
        return this.each( function() {
            var $mainContainer = jq( this ),
                $menuElements = $mainContainer.find( config.selector ),
                categoryGroups = [],
                $menuDropdown;

            // Verify that menu elements exist
            if ( $menuElements.length < 1 ) {
                return;
            }

            // If only one menu is found, disable grouping by default
            if ( $menuElements.length === 1 ) {
                config.categorize = inputSettings.categorize || false;
            }

            // Remove sub-menus if nesting is enabled
            if ( config.hierarchical ) {
                $menuElements.each( function() {
                    // Extract and reinsert sub-menus into the main container
                    jq( this ).find( config.selector ).detach().appendTo( $mainContainer );
                });
            }

            // Process all identified menu elements
            $menuElements.each( function() {
                var $currentMenu = jq( this ),
                    itemChoices = [];

                // Locate all anchor links within this menu
                $currentMenu
                    .find( "a" )
                        .each( function() {
                            var $menuLink = jq( this );

                            // Convert links into select options
                            itemChoices.push(
                                jq( "<option>" )
                                    .val( $menuLink.attr( "href" ) )
                                    .text( $menuLink.text() )
                            );
                        });

                // Group options if the categorization setting is active
                if ( config.categorize ) {
                    // Generate a new option group
                    var $categoryGroup = jq( "<optgroup>" )
                        .attr( "label", $currentMenu.data( config.categoryNameAttr ) )
                        .data( "sequence", $currentMenu.data( config.categorySortAttr ) );

                    // Add individual options to the new group
                    jq.each( itemChoices, function( idx, optionItem ) {
                        $categoryGroup.append( optionItem );
                    });

                    // Replace the flat list of options with the new group
                    itemChoices = $categoryGroup;
                }

                // Append the group (or ungrouped options) to the main list of groups
                jq.each( itemChoices, function( idx, groupPart ) {
                    categoryGroups.push( jq( groupPart ) );
                });
            });

            // Arrange option groups if categorization is enabled
            if ( config.categorize ) {
                categoryGroups = categoryGroups.sort( categorySorter );
            }

            // Construct the main select element
            $menuDropdown = jq( "<select>" )
                .addClass( config.dropdownStyle )
                .attr( "id", config.dropdownId );

            // Add an initial, disabled option to the dropdown
            $menuDropdown.append(
                jq( "<option>" )
                    .text( config.placeholderPrompt )
                    .attr( "disabled", "disabled" )
            );

            // Populate the dropdown with all generated options and groups
            jq( categoryGroups ).each( function() {
                $menuDropdown.append( jq( this ) );
            });

            // Attach an event listener for changes to the dropdown selection
            $menuDropdown.on( "change", function() {
                window.location = jq( this ).find( ":selected" ).val();
            });

            // Enclose the dropdown within a wrapper element if configured
            if ( config.encapsulate ) {
                $menuDropdown = jq( "<" + config.containerElement + ">" )
                    .addClass( config.containerStyle )
                    .attr( "id", config.containerId )
                    .append( $menuDropdown );
            }

            // Insert the final dropdown element into the main container
            $mainContainer.append( $menuDropdown );
        });

    };

}( jQuery ) );