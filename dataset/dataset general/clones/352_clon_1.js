/*
 * Copyright 2009 Asa Wilson.
 * Available under both the GPL and MIT licenses.
 * Please refer to the license files for detailed information.
 */

// This plugin depends on jQuery. Ensure jQuery is loaded before proceeding.
if ( typeof jQuery == 'undefined' ) {
    throw ( "jQuery library was not found. This plugin requires jQuery to function correctly." ) ;
}

// Immediately invoked function expression (IIFE) to encapsulate the plugin logic.
// The jQuery object is passed as '$' to avoid conflicts.
( function ( $ ) {

/*
 * The core DirtyForm utility object, extended onto jQuery.
 * Contains global configuration settings and helper functions for form dirty checking.
 */
$.extend( {
    DirtyForm: {
        // Debugging flag: set to 'true' to enable console logging for development.
        debug         : false,
        // The CSS class name applied to input elements that have been changed.
        changedClass  : 'changed',
        // A placeholder function; can be overridden to return additional elements
        // that should also receive the 'changedClass' when an input changes.
        addClassOn    : new Function(),
        // Internal check to see if a console (e.g., Firebug, Chrome DevTools) is available.
        hasFirebug    : ( "console" in window && "firebug" in window.console ),
        // Determines whether hidden input fields should be included in dirty checking.
        includeHidden : false,
        // The DOM event that triggers the dirty check (e.g., 'blur', 'change').
        monitorEvent  : 'blur',

        /**
         * A simple logger function for internal messages.
         * Messages are displayed in the console (if debug is true and console is available)
         * or via a standard alert box.
         * @param {string} msg - The message string to be logged.
         */
        logger: function ( msg ) {
            if ( this.debug ) {
                msg = "DirtyForm: " + msg ;
                this.hasFirebug
                    ? console.log( msg )
                    : alert( msg ) ;
            }
        },

        /**
         * Retrieves the current value or state of an input element.
         * Handles the specific logic for radio and checkbox inputs.
         * @param {jQuery} input - The jQuery wrapped input element.
         * @returns {any} The input's current value or its 'checked' attribute status.
         */
        input_value: function ( input ) {
            if ( input.is( ':radio,:checkbox' ) ) {
                // For radio/checkbox, 'checked' attribute determines its state.
                return typeof ( input.attr( "checked" ) ) == "undefined"
                    ? false
                    : input.attr( "checked" ) ;
            } else {
                // For other input types, simply return the value.
                return input.val();
            }
        },

        /**
         * Resets a given input element back to its initially stored value.
         * Triggers the monitor event after the reset to update its dirty status.
         * @param {jQuery} input - The jQuery wrapped input element to reset.
         */
        input_reset: function ( input ) {
            if ( input.is( ':radio,:checkbox' ) ) {
                input.attr( 'checked', input.data( 'initial' ) );
            } else {
                input.val( input.data( 'initial' ) );
            }
            // Trigger the monitored event to ensure the form's dirty state is re-evaluated.
            input.trigger( $.DirtyForm.monitorEvent + '.dirty_form' ) ;
        },

        /**
         * The primary event handler for monitoring changes on input fields.
         * This function determines if an input's current value deviates from its initial state,
         * updates the form's dirty status, and applies/removes the 'changedClass'.
         * @param {Event} event - The DOM event object that triggered this handler.
         */
        input_checker: function ( event ) {
            var npt       = $( event.target ) ; // The input element that changed.
            var form      = npt.parents( '.dirtyform' ) ; // The parent form.
            var initial   = npt.data( "initial" ) ; // The input's value when the form was initialized.
            var current   = $.DirtyForm.input_value( npt ) ; // The input's current value.
            var inputs    = event.data.inputs ; // All monitored inputs in the form.
            var settings  = event.data.settings ; // Plugin settings for this form.

            // Compare the initial value with the current value.
            if ( initial != current ) {
                $.DirtyForm.logger( "Form " + form.attr( 'class' ) + " is now dirty. Value changed from \"" + initial + "\" to \"" + current + "\"" ) ;
                $.DirtyForm.logger( "Applying CSS class: " + settings.changedClass ) ;

                // Mark the form as dirty and trigger a custom 'dirty' event.
                form
                    .data( "dirty", true )
                    .trigger( "dirty", {
                        target          : npt,
                        from            : initial,
                        to              : current,
                        preventDefault  : function () {
                            return false
                        },
                        stopPropagation : function () {
                            return false
                        },
                        bubbles         : true,
                        cancelable      : true
                    } ) ;
                // Add the 'changed' class to the input and any related elements.
                npt
                    .add( settings.addClassOn.apply( npt ) )
                    .addClass( settings.changedClass ) ;

            } else {
                // If the value has reverted to its initial state, remove the 'changed' class.
                npt
                    .add( settings.addClassOn.apply( npt ) )
                    .removeClass( settings.changedClass ) ;
            }

            // After checking the current input, verify if any other inputs in the form
            // still possess the 'changedClass'. If none do, the form is now clean.
            if ( ! inputs.filter( '.' + settings.changedClass ).size() ) {
                form
                    .data( "dirty", false ) // Mark the form as clean.
                    .trigger( "clean", { // Trigger a custom 'clean' event.
                        target          : npt,
                        preventDefault  : function () {
                            return false
                        },
                        stopPropagation : function () {
                            return false
                        },
                        bubbles         : true,
                        cancelable      : true
                    } ) ;
            }
        } // End of input_checker.
    } // End of DirtyForm object.
} ) ; // End of $.extend.

/**
 * jQuery plugin: $.fn.clean_form()
 * Resets a form or a collection of input elements to their initial states.
 * This method is chainable.
 */
$.fn.clean_form = function () {
    return this.each( function () {
        var dirtyform = $( this ) ; // Cache the current element.

        // If the element is a form, use its native reset method and then trigger events
        // on any remaining 'changed' inputs to ensure their state is updated.
        if ( dirtyform.is( 'form' ) ) {
            dirtyform.reset().find( '.changed:input' ).each( function () {
                $( this ).trigger( $.DirtyForm.monitorEvent + '.dirty_form' ) ;
            } ) ;
        } else {
            // If it's not a form element, iterate through its inputs to reset them individually.
            var selectorFilters = ':submit,:password,:button' ;
            // Conditionally exclude hidden inputs based on settings.
            if ( ! settings.includeHidden ) {
                selectorFilters = ':hidden,' + selectorFilters ;
            }

            // Select all relevant inputs and apply the reset function.
            $( ':input:not(' + selectorFilters + ')', dirtyform ).each( function () {
                $.DirtyForm.input_reset( $( this ) ) ;
            } ) ;
        }
    } ) ;
} ;

/**
 * jQuery plugin: $.fn.dirty_form()
 * Initializes the dirty checking mechanism for the selected form(s).
 * This method binds event handlers to input fields to monitor changes.
 * It is chainable.
 */
$.fn.dirty_form = function () {
    // Define default settings for this plugin instance.
    var defaults = {
        changedClass  : $.DirtyForm.changedClass, // Inherit global changed class.
        addClassOn    : $.DirtyForm.addClassOn,   // Inherit global addClassOn function.
        dynamic       : $.isFunction( $.livequery ) // Check for livequery plugin availability.
    } ;

    // Merge default settings with any provided options, prioritizing arguments.
    var settings = $.extend( defaults, arguments.length != 0 ? arguments[0] : {} ) ;

    return this.each( function () {
        var form = $( this ) ; // The current form element in the iteration.

        // Construct the selector filters for inputs to be monitored.
        var selectorFilters = ':submit,:password,:button' ;
        if ( ! settings.includeHidden ) {
            selectorFilters = ':hidden,' + selectorFilters ;
        }

        // Select all relevant input elements within the form.
        var inputs = $( ':input:not(' + selectorFilters + ')', form ) ;

        // If the form has already been initialized as a 'dirtyform',
        // unbind previous event handlers to prevent duplicate bindings, then re-apply them.
        if ( form.hasClass( 'dirtyform' ) ) {
            form.unbind( "dirty" ).unbind( "clean" ) ;
            inputs.unbind( $.DirtyForm.monitorEvent + ".dirty_form" ) ;
        } else {
            // If it's a new dirtyform, mark it with the class.
            $( this ).addClass( 'dirtyform' ) ;
        }

        // Log the action for debugging purposes.
        $.DirtyForm.logger( 'Storing initial data for form element: ' + form.get( 0 ) ) ;

        // Apply event handlers based on whether dynamic monitoring (via livequery) is enabled.
        if ( settings.dynamic ) {
            // If livequery is available, use it to bind events to current and future elements.
            inputs.livequery( function () {
                $( this )
                    .bind( $.DirtyForm.monitorEvent + ".dirty_form", {
                        inputs   : inputs,
                        settings : settings
                    }, $.DirtyForm.input_checker )
                    .data( 'initial', $.DirtyForm.input_value( $( this ) ) ) ;
            } ) ;
        } else {
            // Otherwise, bind events directly to existing elements.
            inputs.each( function () {
                $( this )
                    .bind( $.DirtyForm.monitorEvent + ".dirty_form", {
                        inputs   : inputs,
                        settings : settings
                    }, $.DirtyForm.input_checker )
                    .data( "initial", $.DirtyForm.input_value( $( this ) ) ) ;
            } ) ;
        }
    } ) ;
} ;

/**
 * jQuery plugin: $.fn.dirty_stopper()
 * Attaches a warning mechanism to selected links or tab navigation elements.
 * If a dirty form is detected, a confirmation dialog is displayed before proceeding.
 * This method is chainable.
 */
$.fn.dirty_stopper = function () {
    // Default configuration for the confirmation dialog and message.
    var defaults = {
        dialog  : {
            title      : "Warning: Unsaved Changes!",
            height     : 300,
            width      : 500,
            modal      : true,
            resizable  : false,
            autoResize : false,
            overlay    : { backgroundColor: "black", opacity: 0.5 }
        },
        message : '<br/><p>You have changed form data without saving. All of your changes will be lost.</p><p>Are you sure you want to proceed?</p>'
    } ;

    // Merge default settings with any custom options provided, performing a deep merge for 'dialog'.
    var settings = $.extend( true, defaults, arguments.length != 0 ? arguments[0] : {} ) ;

    $.DirtyForm.logger( "Initializing dirty stopper functionality for selected elements." ) ;

    return this.each( function () {
        var stopper = $( this ) ; // The element (e.g., link, tab) that acts as the stopper.

        // Special handling for elements found within jQuery UI tabs navigation.
        if ( $( this ).parents( '.ui-tabs-nav' ).length > 0 ) {
            // This section manages tab switching to prevent data loss.
            var tabs = $( this ).parents( '.ui-tabs-nav' ) ;
            tabs.find( 'a' ).unbind( 'click.dirty_form' ) ;     // Clear any previous click handlers.
            tabs.unbind( 'tabsselect.dirty_form' ) ;            // Clear any previous tabsselect handlers.

            // Bind to the 'tabsselect' event to intercept tab changes.
            tabs.bind( 'tabsselect.dirty_form', function ( event, ui ) {
                if ( $( '.dirtyform' ).are_dirty() ) {
                    event.preventDefault() ; // Prevent the tab from changing immediately.

                    // Create a dynamic dialog element and append it to the body.
                    var div  = $( "<div id='dirty_stopper_dialog'/>" ).appendTo( document.body ) ;
                    var href = $( this ).attr( 'href' ) ; // This href is not directly used for navigation here.

                    // Configure and display the dialog with custom 'Proceed' and 'Cancel' buttons.
                    div.dialog( $.extend( settings.dialog, {
                        buttons: {
                            Proceed: function () {
                                var selected_id = $( ui.tab ).parent().siblings( '.ui-tabs-selected' ).find( 'a' ).attr( 'href' ) ;
                                // Clean up the form(s) in the previously selected tab.
                                $( '.dirtyform', selected_id ).clean_form() ;

                                // Now that the old tab is clean, proceed to select the new tab.
                                tabs.tabs( 'select', $( ui.tab ).attr( 'href' ) ) ;

                                // Close and remove the dialog from the DOM.
                                $( this ).dialog( 'destroy' ).remove() ;
                            },
                            Cancel: function () {
                                $( this ).dialog( 'destroy' ).remove() ; // Simply close the dialog.
                            }
                        }
                    } ) )
                        .dialog( "moveToTop" )
                        .append( settings.message ) ; // Add the warning message content.

                    return false ; // Crucial to prevent default tab selection.
                }
            } ) ;
        } else {
            // Handling for standard links or elements not part of a tab system.
            stopper.unbind( 'click.dirty_form' ) ; // Unbind any previous click handlers.
            stopper.bind( 'click.dirty_form', function ( event ) {
                if ( $( '.dirtyform' ).are_dirty() ) {
                    event.preventDefault() ; // Prevent the default link action.

                    var div  = $( "<div id='dirty_stopper_dialog'/>" ).appendTo( document.body ) ;
                    var href = $( this ).attr( 'href' ) ; // Get the target URL for navigation.

                    // Configure and display the dialog.
                    div.dialog( $.extend( {
                        buttons: {
                            Proceed: function () {
                                window.location = href ; // Navigate to the target URL.
                            },
                            Cancel: function () {
                                $( this ).dialog( 'destroy' ).remove() ;
                                return false ; // Stay on the current page.
                            }
                        }
                    }, settings.dialog ) )
                        .dialog( "moveToTop" )
                        .append( settings.message ) ;
                }
            } ) ;
        }
    } ) ;
} ;

/**
 * jQuery plugin: $.fn.are_dirty()
 * Checks if any of the forms within the current jQuery selection are marked as dirty.
 * Note: This method is NOT chainable as it returns a boolean value.
 * @returns {boolean} True if at least one selected form is dirty, otherwise false.
 */
$.fn.are_dirty = function () {
    var dirty = false ; // Initialize dirty status as false.
    this.each( function () {
        // Check the 'dirty' data attribute on each element in the selection.
        if ( $( this ).data( 'dirty' ) ) {
            dirty = true ; // If a dirty form is found, set flag to true.
            return false ; // Exit the .each() loop early, no need to check further.
        }
    } ) ;
    return dirty ; // Return the determined dirty status.
} ;

/**
 * jQuery plugin: $.fn.dirty_checker()
 * This plugin is intended primarily for testing and debugging purposes.
 * It attaches a click event handler to the selected elements, which will display
 * an alert indicating whether any form on the page is currently in a dirty state.
 */
$.fn.dirty_checker = function () {
    $.DirtyForm.logger( "Setting up dirty checker functionality for selected elements!" ) ;

    return this.each( function () {
        var checker = $( this ) ; // The element to which the click handler will be attached.
        checker.click( function () {
            // Check all forms on the current page using the .are_dirty() method.
            if ( $( "form" ).are_dirty() ) {
                alert( "Attention: There are dirty forms on this page that require saving!" ) ;
            } else {
                alert( "All forms are currently clean... you can proceed without worries!" ) ;
            }
        } ) ;
    } ) ;
} ;

/**
 * jQuery plugin extensions for custom event binding.
 * Provides convenient shorthand methods for attaching handlers to the 'dirty' and 'clean' events
 * triggered by the DirtyForm plugin.
 */
$.fn.extend( {
    // Shorthand for binding a function to the custom 'dirty' event.
    dirty: function ( fn ) {
        return this.bind( 'dirty', fn ) ;
    },
    // Shorthand for binding a function to the custom 'clean' event.
    clean: function ( fn ) {
        return this.bind( 'clean', fn ) ;
    }
} ) ;

} ) ( jQuery ) ; // End of the IIFE, passing the jQuery object.