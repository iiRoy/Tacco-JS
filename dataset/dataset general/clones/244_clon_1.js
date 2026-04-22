// This file contains the core logic for the Bootstrap Dual Listbox plugin.
// Version: v3.0.1
// Purpose: Provides a responsive dual listbox widget, designed to integrate seamlessly with Twitter Bootstrap.
//          It aims for broad browser compatibility, including modern desktop browsers and touch-enabled devices.
// Project URL: http://www.virtuosoft.eu/code/bootstrap-duallistbox/
// Author: István Ujj-Mészáros
// License: Distributed under the Apache License v2.0. Please see the project's official documentation for details.

// The plugin is encapsulated within an Immediately Invoked Function Expression (IIFE)
// to prevent polluting the global namespace and ensure jQuery is available.
;(function ( $, window, document, undefined ) {

    // Define plugin-wide constants and default settings.
    // These defaults can be overridden by user-provided options during initialization.
    var pluginName = 'bootstrapDualListbox',

        defaults = {
            bootstrap2Compatible: false,                 // Flag to enable Bootstrap 2 compatibility styling.
            filterTextClear: 'show all',                 // Text for the button to clear filter input.
            filterPlaceHolder: 'Filter',                 // Placeholder text for the filter input fields.
            moveSelectedLabel: 'Move selected',          // Tooltip/label for moving selected items to the other list.
            moveAllLabel: 'Move all',                    // Tooltip/label for moving all items to the other list.
            removeSelectedLabel: 'Remove selected',      // Tooltip/label for removing selected items from the other list.
            removeAllLabel: 'Remove all',                // Tooltip/label for removing all items from the other list.
            moveOnSelect: true,                          // If true, selecting an item moves it immediately.
                                                         // Note: This is forced to true on Android due to a known bug.
            preserveSelectionOnMove: false,              // Controls how selections are preserved: 'all', 'moved', or false.
            selectedListLabel: false,                    // Optional label for the selected items list. Can be a string or false.
            nonSelectedListLabel: false,                 // Optional label for the non-selected items list. Can be a string or false.
            helperSelectNamePostfix: '_helper',          // Postfix for the helper select element names.
            selectOrMinimalHeight: 100,                  // Minimum height for the select elements.
            showFilterInputs: true,                      // Boolean to control visibility of filter input fields.
            nonSelectedFilter: '',                       // Initial filter string for the non-selected list.
            selectedFilter: '',                          // Initial filter string for the selected list.
            infoText: 'Showing all {0}',                 // Information text displayed when all options are visible.
                                                         // {0} is replaced by the number of visible items.
                                                         // Set to false to disable info text.
            infoTextFiltered: '<span class="label label-warning">Filtered</span> {0} from {1}',
                                                         // Information text displayed when options are filtered.
                                                         // {0} = visible items, {1} = total items.
            infoTextEmpty: 'Empty list',                 // Information text displayed when a list is empty.
            filterOnValues: false                        // If true, filtering is applied to option values instead of text.
        },

        // Detect if the browser is a buggy Android version.
        // Selections within styled <select> elements can be invisible on some Android versions.
        // Reference: http://code.google.com/p/android/issues/detail?id=16922
        isBuggyAndroid = /android/i.test(navigator.userAgent.toLowerCase());


    // The main plugin constructor function.
    // Initializes a new instance of the dual listbox.
    function BootstrapDualListbox( element, options ) {
        // Store the original select element.
        this.element = $( element );

        // jQuery's `$.extend` method is used to merge the default options with
        // any user-provided options. The first argument `{}` ensures that
        // the `defaults` object itself is not modified, preserving it for
        // future instances of the plugin.
        this.settings = $.extend( {}, defaults, options );

        // Store references to the default options and plugin name.
        this._defaults = defaults;
        this._name = pluginName;

        // Initialize the plugin instance.
        this.init();
    }


    // Helper function to trigger the 'change' event on the original select element.
    // This allows external code to react to changes made by the dual listbox.
    function triggerChangeEvent( dualListbox ) {
        dualListbox.element.trigger( 'change' );
    }


    // Updates the internal selection states of the original select options.
    // Assigns a unique 'original-index' and a '_selected' data attribute to each option.
    function updateSelectionStates( dualListbox ) {
        dualListbox.element.find( 'option' ).each( function( index, item ) {
            var $item = $( item );

            // Assign a unique original index if not already present.
            // This helps in maintaining order and referencing options.
            if ( typeof( $item.data( 'original-index' ) ) === 'undefined' ) {
                $item.data( 'original-index', dualListbox.elementCount++ );
            }

            // Initialize a '_selected' data attribute to track selection state internally.
            if ( typeof( $item.data( '_selected' ) ) === 'undefined' ) {
                $item.data( '_selected', false );
            }
        });
    }


    // Changes the 'selected' property of an option in the original select element
    // based on its 'original-index'.
    function changeSelectionState( dualListbox, original_index, selected ) {
        dualListbox.element.find( 'option' ).each( function( index, item ) {
            var $item = $( item );

            // Find the option by its original index and set its selected state.
            if ( $item.data( 'original-index' ) === original_index ) {
                $item.prop( 'selected', selected );
            }
        });
    }


    // Formats a string by replacing placeholders like {0}, {1} with corresponding arguments.
    // Similar to `String.prototype.format` in other languages.
    function formatString( s, args ) {
        return s.replace( /\{(\d+)\}/g, function( match, number ) {
            return typeof args[ number ] !== 'undefined' ? args[ number ] : match;
        });
    }


    // Refreshes the information text (e.g., "Showing all X", "Filtered X from Y")
    // for both dual listbox panels.
    function refreshInfo( dualListbox ) {
        // If info text is disabled in settings, do nothing.
        if ( !dualListbox.settings.infoText ) {
            return;
        }

        // Get the number of visible options in each select.
        var visible1 = dualListbox.elements.select1.find( 'option' ).length,
            visible2 = dualListbox.elements.select2.find( 'option' ).length,
            // Calculate total options in each logical list (non-selected and selected).
            all1 = dualListbox.element.find( 'option' ).length - dualListbox.selectedElements,
            all2 = dualListbox.selectedElements,
            content = ''; // Variable to hold the info text content.

        // --- Info for the non-selected list (box1) ---
        if ( all1 === 0 ) {
            content = dualListbox.settings.infoTextEmpty;
        } else if ( visible1 === all1 ) {
            content = formatString( dualListbox.settings.infoText, [ visible1, all1 ] );
        } else {
            content = formatString( dualListbox.settings.infoTextFiltered, [ visible1, all1 ] );
        }

        // Update the info text HTML and toggle 'filtered' class.
        dualListbox.elements.info1.html( content );
        dualListbox.elements.box1.toggleClass( 'filtered', !( visible1 === all1 || all1 === 0 ) );

        // --- Info for the selected list (box2) ---
        if ( all2 === 0 ) {
            content = dualListbox.settings.infoTextEmpty;
        } else if ( visible2 === all2 ) {
            content = formatString( dualListbox.settings.infoText, [ visible2, all2 ] );
        } else {
            content = formatString( dualListbox.settings.infoTextFiltered, [ visible2, all2 ] );
        }

        // Update the info text HTML and toggle 'filtered' class.
        dualListbox.elements.info2.html( content );
        dualListbox.elements.box2.toggleClass( 'filtered', !( visible2 === all2 || all2 === 0 ) );
    }


    // Refreshes both dual listbox selects based on the state of the original select element.
    function refreshSelects( dualListbox ) {
        dualListbox.selectedElements = 0; // Reset counter for selected elements.

        // Clear existing options from both helper selects.
        dualListbox.elements.select1.empty();
        dualListbox.elements.select2.empty();

        // Iterate over each option in the original select element.
        dualListbox.element.find( 'option' ).each( function( index, item ) {
            var $item = $( item );

            // If the option is selected, append it to the 'selected' list (select2).
            if ( $item.prop( 'selected' ) ) {
                dualListbox.selectedElements++;
                dualListbox.elements.select2.append( $item.clone( true ).prop( 'selected', $item.data( '_selected' ) ) );
            }
            // Otherwise, append it to the 'non-selected' list (select1).
            else {
                dualListbox.elements.select1.append( $item.clone( true ).prop( 'selected', $item.data( '_selected' ) ) );
            }
        });

        // If filter inputs are enabled, re-apply filters after refresh.
        if ( dualListbox.settings.showFilterInputs ) {
            filter( dualListbox, 1 ); // Filter non-selected list.
            filter( dualListbox, 2 ); // Filter selected list.
        }

        // Update the info text after refreshing select contents.
        refreshInfo( dualListbox );
    }


    // Applies filtering to one of the dual listbox selects.
    // selectIndex: 1 for non-selected list, 2 for selected list.
    function filter( dualListbox, selectIndex ) {
        // If filter inputs are not shown, this function should not execute.
        if ( !dualListbox.settings.showFilterInputs ) {
            return;
        }

        // Save current selections before filtering, as filtering re-renders options.
        saveSelections( dualListbox, selectIndex );

        // Clear the target select and reset its scroll position.
        dualListbox.elements[ 'select' + selectIndex ].empty().scrollTop( 0 );

        // Create a regular expression from the filter input value.
        var regex = new RegExp( $.trim( dualListbox.elements[ 'filterInput' + selectIndex ].val() ), 'gi' ),
            options = dualListbox.element; // Start with all options from the original select.

        // Determine which set of options to filter (selected or non-selected).
        if ( selectIndex === 1 ) {
            options = options.find( 'option' ).not( ':selected' ); // Non-selected options.
        } else {
            options = options.find( 'option:selected' ); // Selected options.
        }

        // Iterate through the relevant options and apply the filter.
        options.each( function( index, item ) {
            var $item = $( item ),
                isFiltered = true; // Assume item is filtered until a match is found.

            // Check if the item's text or value (if filterOnValues is true) matches the regex.
            if ( item.text.match( regex ) || ( dualListbox.settings.filterOnValues && $item.attr( 'value' ).match( regex ) ) ) {
                isFiltered = false; // Item is not filtered, it should be shown.
                // Append a clone of the item to the filtered select, preserving its internal selection state.
                dualListbox.elements[ 'select' + selectIndex ].append( $item.clone( true ).prop( 'selected', $item.data( '_selected' ) ) );
            }

            // Update the 'filtered' data attribute on the original option.
            dualListbox.element.find( 'option' ).eq( $item.data( 'original-index' ) ).data( 'filtered' + selectIndex, isFiltered );
        });

        // Refresh the info text as the visible options have changed.
        refreshInfo( dualListbox );
    }


    // Saves the current selection state of options in a helper select back to the original options.
    function saveSelections( dualListbox, selectIndex ) {
        dualListbox.elements[ 'select' + selectIndex ].find( 'option' ).each( function( index, item ) {
            var $item = $( item );
            // Update the '_selected' data attribute on the corresponding original option.
            dualListbox.element.find( 'option' ).eq( $item.data( 'original-index' ) ).data( '_selected', $item.prop( 'selected' ) );
        });
    }


    // Sorts options within a given select element based on their 'original-index'.
    // This ensures that options maintain their initial order when moved between lists.
    function sortOptions( select ) {
        select.find( 'option' ).sort( function( a, b ) {
            return ( $( a ).data( 'original-index' ) > $( b ).data( 'original-index' ) ) ? 1 : -1;
        }).appendTo( select ); // Append sorted options back to the select.
    }


    // Clears all internal '_selected' states for options in the non-selected list.
    function clearSelections( dualListbox ) {
        dualListbox.elements.select1.find( 'option' ).each( function() {
            dualListbox.element.find( 'option' ).data( '_selected', false );
        });
    }


    // Moves selected options from the non-selected list to the selected list.
    function move( dualListbox ) {
        // Preserve selections based on the configured strategy.
        if ( dualListbox.settings.preserveSelectionOnMove === 'all' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 1 );
            saveSelections( dualListbox, 2 );
        } else if ( dualListbox.settings.preserveSelectionOnMove === 'moved' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 1 );
        }

        // Iterate through selected options in the non-selected list.
        dualListbox.elements.select1.find( 'option:selected' ).each( function( index, item ) {
            var $item = $( item );
            // Only move options that are not currently filtered out.
            if ( !$item.data( 'filtered1' ) ) {
                changeSelectionState( dualListbox, $item.data( 'original-index' ), true ); // Mark as selected in original.
            }
        });

        // Refresh the UI, trigger change event, and sort the destination list.
        refreshSelects( dualListbox );
        triggerChangeEvent( dualListbox );
        sortOptions( dualListbox.elements.select2 );
    }


    // Moves selected options from the selected list back to the non-selected list.
    function remove( dualListbox ) {
        // Preserve selections based on the configured strategy.
        if ( dualListbox.settings.preserveSelectionOnMove === 'all' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 1 );
            saveSelections( dualListbox, 2 );
        } else if ( dualListbox.settings.preserveSelectionOnMove === 'moved' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 2 );
        }

        // Iterate through selected options in the selected list.
        dualListbox.elements.select2.find( 'option:selected' ).each( function( index, item ) {
            var $item = $( item );
            // Only remove options that are not currently filtered out.
            if ( !$item.data( 'filtered2' ) ) {
                changeSelectionState( dualListbox, $item.data( 'original-index' ), false ); // Mark as non-selected in original.
            }
        });

        // Refresh the UI, trigger change event, and sort the destination list.
        refreshSelects( dualListbox );
        triggerChangeEvent( dualListbox );
        sortOptions( dualListbox.elements.select1 );
    }


    // Moves all non-filtered options from the non-selected list to the selected list.
    function moveAll( dualListbox ) {
        // Preserve selections based on the configured strategy.
        if ( dualListbox.settings.preserveSelectionOnMove === 'all' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 1 );
            saveSelections( dualListbox, 2 );
        } else if ( dualListbox.settings.preserveSelectionOnMove === 'moved' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 1 );
        }

        // Iterate through all options in the original select.
        dualListbox.element.find( 'option' ).each( function( index, item ) {
            var $item = $( item );
            // Mark options as selected if they are not filtered out from the non-selected list.
            if ( !$item.data( 'filtered1' ) ) {
                $item.prop( 'selected', true );
            }
        });

        // Refresh the UI and trigger change event.
        refreshSelects( dualListbox );
        triggerChangeEvent( dualListbox );
    }


    // Moves all non-filtered options from the selected list back to the non-selected list.
    function removeAll( dualListbox ) {
        // Preserve selections based on the configured strategy.
        if ( dualListbox.settings.preserveSelectionOnMove === 'all' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 1 );
            saveSelections( dualListbox, 2 );
        } else if ( dualListbox.settings.preserveSelectionOnMove === 'moved' && !dualListbox.settings.moveOnSelect ) {
            saveSelections( dualListbox, 2 );
        }

        // Iterate through all options in the original select.
        dualListbox.element.find( 'option' ).each( function( index, item ) {
            var $item = $( item );
            // Mark options as non-selected if they are not filtered out from the selected list.
            if ( !$item.data( 'filtered2' ) ) {
                $item.prop( 'selected', false );
            }
        });

        // Refresh the UI and trigger change event.
        refreshSelects( dualListbox );
        triggerChangeEvent( dualListbox );
    }


    // Binds all necessary event handlers to the dual listbox elements.
    function bindEvents( dualListbox ) {
        // Prevent form submission when filter inputs are focused and Enter is pressed.
        dualListbox.elements.form.submit( function( e ) {
            if ( dualListbox.elements.filterInput1.is( ':focus' ) ) {
                e.preventDefault();
                dualListbox.elements.filterInput1.focusout();
            } else if ( dualListbox.elements.filterInput2.is( ':focus' ) ) {
                e.preventDefault();
                dualListbox.elements.filterInput2.focusout();
            }
        });

        // Custom event listener for external refresh requests.
        dualListbox.element.on( 'bootstrapDualListbox.refresh', function( e, mustClearSelections ) {
            dualListbox.refresh( mustClearSelections );
        });

        // Click handler for clearing the non-selected list filter.
        dualListbox.elements.filterClear1.on( 'click', function() {
            dualListbox.setNonSelectedFilter( '', true );
        });

        // Click handler for clearing the selected list filter.
        dualListbox.elements.filterClear2.on( 'click', function() {
            dualListbox.setSelectedFilter( '', true );
        });

        // Click handler for moving selected items from non-selected to selected list.
        dualListbox.elements.moveButton.on( 'click', function() {
            move( dualListbox );
        });

        // Click handler for moving all items from non-selected to selected list.
        dualListbox.elements.moveAllButton.on( 'click', function() {
            moveAll( dualListbox );
        });

        // Click handler for removing selected items from selected to non-selected list.
        dualListbox.elements.removeButton.on( 'click', function() {
            remove( dualListbox );
        });

        // Click handler for removing all items from selected to non-selected list.
        dualListbox.elements.removeAllButton.on( 'click', function() {
            removeAll( dualListbox );
        });

        // Event handler for filter input changes in the non-selected list.
        dualListbox.elements.filterInput1.on( 'change keyup', function() {
            filter( dualListbox, 1 );
        });

        // Event handler for filter input changes in the selected list.
        dualListbox.elements.filterInput2.on( 'change keyup', function() {
            filter( dualListbox, 2 );
        });
    }


    // Define the prototype methods for the BootstrapDualListbox plugin.
    BootstrapDualListbox.prototype = {
        // Initialization method for the plugin instance.
        init: function () {
            // Construct the HTML template for the dual listbox UI.
            // This template includes two boxes, labels, filter inputs, buttons, and select elements.
            this.container = $( '' +
                '<div class="bootstrap-duallistbox-container">' +
                ' <div class="box1">' +
                '   <label></label>' +
                '   <span class="info-container">' +
                '     <span class="info"></span>' +
                '     <button type="button" class="btn clear1 pull-right"></button>' +
                '   </span>' +
                '   <input class="filter" type="text">' +
                '   <div class="btn-group buttons">' +
                '     <button type="button" class="btn moveall">' +
                '       <i></i>' +
                '       <i></i>' +
                '     </button>' +
                '     <button type="button" class="btn move">' +
                '       <i></i>' +
                '     </button>' +
                '   </div>' +
                '   <select multiple="multiple"></select>' +
                ' </div>' +
                ' <div class="box2">' +
                '   <label></label>' +
                '   <span class="info-container">' +
                '     <span class="info"></span>' +
                '     <button type="button" class="btn clear2 pull-right"></button>' +
                '   </span>' +
                '   <input class="filter" type="text">' +
                '   <div class="btn-group buttons">' +
                '     <button type="button" class="btn remove">' +
                '       <i></i>' +
                '     </button>' +
                '     <button type="button" class="btn removeall">' +
                '       <i></i>' +
                '       <i></i>' +
                '     </button>' +
                '   </div>' +
                '   <select multiple="multiple"></select>' +
                ' </div>' +
                '</div>' )
                .insertBefore( this.element ); // Insert the generated HTML before the original select.

            // Cache references to all important DOM elements within the dual listbox container.
            // This avoids repeated DOM lookups and improves performance.
            this.elements = {
                originalSelect: this.element,                                        // The original select element.
                box1: $( '.box1', this.container ),                                  // Container for non-selected items.
                box2: $( '.box2', this.container ),                                  // Container for selected items.
                filterInput1: $( '.box1 .filter', this.container ),                  // Filter input for non-selected list.
                filterInput2: $( '.box2 .filter', this.container ),                  // Filter input for selected list.
                filterClear1: $( '.box1 .clear1', this.container ),                  // Clear filter button for non-selected list.
                filterClear2: $( '.box2 .clear2', this.container ),                  // Clear filter button for selected list.
                label1: $( '.box1 > label', this.container ),                        // Label for non-selected list.
                label2: $( '.box2 > label', this.container ),                        // Label for selected list.
                info1: $( '.box1 .info', this.container ),                           // Info text for non-selected list.
                info2: $( '.box2 .info', this.container ),                           // Info text for selected list.
                select1: $( '.box1 select', this.container ),                        // Helper select for non-selected items.
                select2: $( '.box2 select', this.container ),                        // Helper select for selected items.
                moveButton: $( '.box1 .move', this.container ),                      // Button to move selected items.
                removeButton: $( '.box2 .remove', this.container ),                  // Button to remove selected items.
                moveAllButton: $( '.box1 .moveall', this.container ),                // Button to move all items.
                removeAllButton: $( '.box2 .removeall', this.container ),            // Button to remove all items.
                form: $( $( '.box1 .filter', this.container )[ 0 ].form )            // The form containing the dual listbox.
            };

            // Retrieve the original select's name attribute.
            this.originalSelectName = this.element.attr( 'name' ) || '';

            // Generate unique IDs for the helper select elements and their labels.
            var select1Id = 'bootstrap-duallistbox-nonselected-list_' + this.originalSelectName,
                select2Id = 'bootstrap-duallistbox-selected-list_' + this.originalSelectName;

            // Assign the generated IDs to the helper selects and their corresponding labels.
            this.elements.select1.attr( 'id', select1Id );
            this.elements.select2.attr( 'id', select2Id );
            this.elements.label1.attr( 'for', select1Id );
            this.elements.label2.attr( 'for', select2Id );

            // Initialize internal state variables.
            this.selectedElements = 0;   // Counter for currently selected options.
            this.elementCount = 0;       // Counter for total options, used for original-index.

            // Apply all initial settings using their respective setter methods.
            // This ensures that default values or user-provided options are correctly rendered.
            this.setBootstrap2Compatible( this.settings.bootstrap2Compatible );
            this.setFilterTextClear( this.settings.filterTextClear );
            this.setFilterPlaceHolder( this.settings.filterPlaceHolder );
            this.setMoveSelectedLabel( this.settings.moveSelectedLabel );
            this.setMoveAllLabel( this.settings.moveAllLabel );
            this.setRemoveSelectedLabel( this.settings.removeSelectedLabel );
            this.setRemoveAllLabel( this.settings.removeAllLabel );
            this.setMoveOnSelect( this.settings.moveOnSelect );
            this.setPreserveSelectionOnMove( this.settings.preserveSelectionOnMove );
            this.setSelectedListLabel( this.settings.selectedListLabel );
            this.setNonSelectedListLabel( this.settings.nonSelectedListLabel );
            this.setHelperSelectNamePostfix( this.settings.helperSelectNamePostfix );
            this.setSelectOrMinimalHeight( this.settings.selectOrMinimalHeight );

            // Update the internal selection states for all options initially.
            updateSelectionStates( this );

            // Apply filter-related settings.
            this.setShowFilterInputs( this.settings.showFilterInputs );
            this.setNonSelectedFilter( this.settings.nonSelectedFilter );
            this.setSelectedFilter( this.settings.selectedFilter );
            this.setInfoText( this.settings.infoText );
            this.setInfoTextFiltered( this.settings.infoTextFiltered );
            this.setInfoTextEmpty( this.settings.infoTextEmpty );
            this.setFilterOnValues( this.settings.filterOnValues );

            // Hide the original select element as it's now replaced by the dual listbox UI.
            this.element.hide();

            // Bind all user interaction events to the newly created UI elements.
            bindEvents( this );

            // Perform an initial refresh to populate the dual listbox with options.
            refreshSelects( this );

            // Return the original element for chaining jQuery methods.
            return this.element;
        },


        // Setter for the 'bootstrap2Compatible' setting.
        // Adjusts CSS classes to match Bootstrap 2 styling conventions.
        setBootstrap2Compatible: function( value, refresh ) {
            this.settings.bootstrap2Compatible = value;
            if ( value ) {
                // Apply Bootstrap 2 specific classes.
                this.container.removeClass( 'row' ).addClass( 'row-fluid bs2compatible' );
                this.container.find( '.box1, .box2' ).removeClass( 'col-md-6' ).addClass( 'span6' );
                this.container.find( '.clear1, .clear2' ).removeClass( 'btn-default btn-xs' ).addClass( 'btn-mini' );
                this.container.find( 'input, select' ).removeClass( 'form-control' );
                this.container.find( '.btn' ).removeClass( 'btn-default' );
                this.container.find( '.moveall > i, .move > i' ).removeClass( 'glyphicon glyphicon-arrow-right' ).addClass( 'icon-arrow-right' );
                this.container.find( '.removeall > i, .remove > i' ).removeClass( 'glyphicon glyphicon-arrow-left' ).addClass( 'icon-arrow-left' );
            } else {
                // Apply Bootstrap 3+ specific classes (default behavior).
                this.container.removeClass( 'row-fluid bs2compatible' ).addClass( 'row' );
                this.container.find( '.box1, .box2' ).removeClass( 'span6' ).addClass( 'col-md-6' );
                this.container.find( '.clear1, .clear2' ).removeClass( 'btn-mini' ).addClass( 'btn-default btn-xs' );
                this.container.find( 'input, select' ).addClass( 'form-control' );
                this.container.find( '.btn' ).addClass( 'btn-default' );
                this.container.find( '.moveall > i, .move > i' ).removeClass( 'icon-arrow-right' ).addClass( 'glyphicon glyphicon-arrow-right' );
                this.container.find( '.removeall > i, .remove > i' ).removeClass( 'icon-arrow-left' ).addClass( 'glyphicon glyphicon-arrow-left' );
            }
            // Optionally refresh the selects after changing compatibility mode.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'filterTextClear' setting.
        // Updates the text displayed on the filter clear buttons.
        setFilterTextClear: function( value, refresh ) {
            this.settings.filterTextClear = value;
            this.elements.filterClear1.html( value );
            this.elements.filterClear2.html( value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'filterPlaceHolder' setting.
        // Updates the placeholder text for the filter input fields.
        setFilterPlaceHolder: function( value, refresh ) {
            this.settings.filterPlaceHolder = value;
            this.elements.filterInput1.attr( 'placeholder', value );
            this.elements.filterInput2.attr( 'placeholder', value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'moveSelectedLabel' setting.
        // Updates the tooltip/title for the 'move selected' button.
        setMoveSelectedLabel: function( value, refresh ) {
            this.settings.moveSelectedLabel = value;
            this.elements.moveButton.attr( 'title', value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'moveAllLabel' setting.
        // Updates the tooltip/title for the 'move all' button.
        setMoveAllLabel: function( value, refresh ) {
            this.settings.moveAllLabel = value;
            this.elements.moveAllButton.attr( 'title', value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'removeSelectedLabel' setting.
        // Updates the tooltip/title for the 'remove selected' button.
        setRemoveSelectedLabel: function( value, refresh ) {
            this.settings.removeSelectedLabel = value;
            this.elements.removeButton.attr( 'title', value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'removeAllLabel' setting.
        // Updates the tooltip/title for the 'remove all' button.
        setRemoveAllLabel: function( value, refresh ) {
            this.settings.removeAllLabel = value;
            this.elements.removeAllButton.attr( 'title', value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'moveOnSelect' setting.
        // If true, selecting an option automatically moves it.
        // Note: This is overridden to true for buggy Android browsers.
        setMoveOnSelect: function( value, refresh ) {
            // Force moveOnSelect to true for known buggy Android versions.
            if ( isBuggyAndroid ) {
                value = true;
            }
            this.settings.moveOnSelect = value;
            // Unbind and rebind 'change' event based on the new setting.
            if ( value ) {
                this.elements.select1.on( 'change', function() {
                    move( dualListbox ); // Move selected from non-selected list.
                });
                this.elements.select2.on( 'change', function() {
                    remove( dualListbox ); // Remove selected from selected list.
                });
            } else {
                this.elements.select1.off( 'change' );
                this.elements.select2.off( 'change' );
            }
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'preserveSelectionOnMove' setting.
        // Controls how selections in the helper lists are handled during moves.
        setPreserveSelectionOnMove: function( value, refresh ) {
            this.settings.preserveSelectionOnMove = value;
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'selectedListLabel' setting.
        // Sets the label for the selected items list.
        setSelectedListLabel: function( value, refresh ) {
            this.settings.selectedListLabel = value;
            if ( value ) {
                this.elements.label2.html( value ).show();
            } else {
                this.elements.label2.hide();
            }
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'nonSelectedListLabel' setting.
        // Sets the label for the non-selected items list.
        setNonSelectedListLabel: function( value, refresh ) {
            this.settings.nonSelectedListLabel = value;
            if ( value ) {
                this.elements.label1.html( value ).show();
            } else {
                this.elements.label1.hide();
            }
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'helperSelectNamePostfix' setting.
        // Appends a postfix to the name attribute of the helper select elements.
        setHelperSelectNamePostfix: function( value, refresh ) {
            this.settings.helperSelectNamePostfix = value;
            if ( value ) {
                this.elements.select1.attr( 'name', this.originalSelectName + value + '1' );
                this.elements.select2.attr( 'name', this.originalSelectName + value + '2' );
            } else {
                this.elements.select1.removeAttr( 'name' );
                this.elements.select2.removeAttr( 'name' );
            }
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'selectOrMinimalHeight' setting.
        // Sets the minimum height for both helper select elements.
        setSelectOrMinimalHeight: function( value, refresh ) {
            this.settings.selectOrMinimalHeight = value;
            var height = value;
            // If the original select has a specific height, use that, otherwise use the minimal height.
            if ( this.element.height() ) {
                height = this.element.height();
            }
            this.elements.select1.height( height );
            this.elements.select2.height( height );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'showFilterInputs' setting.
        // Controls the visibility of the filter input fields and related clear buttons.
        setShowFilterInputs: function( value, refresh ) {
            this.settings.showFilterInputs = value;
            if ( value ) {
                this.elements.filterInput1.show();
                this.elements.filterInput2.show();
                this.elements.filterClear1.show();
                this.elements.filterClear2.show();
            } else {
                this.elements.filterInput1.hide();
                this.elements.filterInput2.hide();
                this.elements.filterClear1.hide();
                this.elements.filterClear2.hide();
            }
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'nonSelectedFilter' setting.
        // Sets the initial filter value for the non-selected list.
        setNonSelectedFilter: function( value, refresh ) {
            this.settings.nonSelectedFilter = value;
            this.elements.filterInput1.val( value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'selectedFilter' setting.
        // Sets the initial filter value for the selected list.
        setSelectedFilter: function( value, refresh ) {
            this.settings.selectedFilter = value;
            this.elements.filterInput2.val( value );
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'infoText' setting.
        // Updates the template for the information text when all options are visible.
        setInfoText: function( value, refresh ) {
            this.settings.infoText = value;
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'infoTextFiltered' setting.
        // Updates the template for the information text when options are filtered.
        setInfoTextFiltered: function( value, refresh ) {
            this.settings.infoTextFiltered = value;
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'infoTextEmpty' setting.
        // Updates the text displayed when a list is empty.
        setInfoTextEmpty: function( value, refresh ) {
            this.settings.infoTextEmpty = value;
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Setter for the 'filterOnValues' setting.
        // Determines whether filtering should apply to option values or text content.
        setFilterOnValues: function( value, refresh ) {
            this.settings.filterOnValues = value;
            // Optionally refresh the selects.
            if ( refresh ) {
                refreshSelects( this );
            }
            return this.element;
        },


        // Destroys the dual listbox instance, reverting the original select element.
        destroy: function () {
            // Restore the original select element to its initial state.
            this.element.show();
            this.container.remove(); // Remove the dual listbox UI.

            // Remove all data attributes added by the plugin to the original options.
            this.element.off( 'bootstrapDualListbox.refresh' );
            this.element.find( 'option' ).each( function( index, item ) {
                var $item = $( item );
                $item.removeData( 'original-index' );
                $item.removeData( '_selected' );
                $item.removeData( 'filtered1' );
                $item.removeData( 'filtered2' );
            });

            // Remove the plugin instance from the element's data.
            this.element.removeData( 'plugin_' + pluginName );
            return this.element;
        },


        // Refreshes the dual listbox display.
        // If `clearSelections` is true, all internal selections are cleared before refresh.
        refresh: function ( clearSelectionsParam ) {
            // Apply all settings again, ensuring the UI reflects current configurations.
            this.set=function( settingsName, value, refresh ) {
                this.settings[ settingsName ] = value;
                if ( refresh ) {
                    refreshSelects( this );
                }
                return this.element;
            };

            // If requested, clear all internal selection states.
            if ( clearSelectionsParam ) {
                clearSelections( this );
            }

            // Update internal selection states and then refresh the UI.
            updateSelectionStates( this );
            refreshSelects( this );
            return this.element;
        }
    };


    // Plugin wrapper for jQuery.
    // This allows the plugin to be called using `$(selector).bootstrapDualListbox()`.
    $.fn[ pluginName ] = function ( options ) {
        return this.each( function () {
            // Prevent multiple instantiations on the same element.
            if ( !$.data( this, 'plugin_' + pluginName ) ) {
                $.data( this, 'plugin_' + pluginName,
                    new BootstrapDualListbox( this, options ) );
            }
        });
    };

})( jQuery, window, document );
// End of the IIFE. The plugin is now available via jQuery.