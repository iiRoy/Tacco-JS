// This file contains a custom extension for jQuery Validation.
// It integrates Bootstrap tooltips for displaying validation error messages.
//
// Project Name: jQuery Validation Bootstrap Tooltip Extension
// Version:      0.7 (Stable)
// Repository:   https://github.com/Thrilleratplay/jQuery-Validation-Bootstrap-tooltip
//
// Author:       Tom Hiller
// Copyright:    (c) 2015 Tom Hiller. All rights reserved.
// License:      MIT License - http://www.opensource.org/licenses/mit-license.php
//
// This allows for dynamic tooltip generation based on validation states.
//

( function ( $ ) {

    // Extend jQuery Validation's core functionality.
    // The 'true' argument ensures a deep merge of properties.
    $.extend( true, $.validator, {

        prototype: {

            // Overrides the default showErrors method to integrate Bootstrap tooltips.
            defaultShowErrors: function () {

                var self = this; // Cache 'this' for use in inner functions.

                // Iterate over elements that were previously invalid but are now valid.
                $.each( this.successList, function ( index, value ) {

                    // Remove error class, add valid class, and destroy any existing tooltip.
                    $( value ) . removeClass( self.settings.errorClass )
                               . addClass( self.settings.validClass )
                               . tooltip( 'destroy' );

                    // If an unhighlight callback is defined in settings, execute it.
                    if ( self.settings.unhighlight ) {

                        self.settings.unhighlight.call( self,
                                                        value,
                                                        self.settings.errorClass,
                                                        self.settings.validClass );
                    }

                } ); // End of successList iteration.


                // Iterate over elements that are currently invalid.
                $.each( this.errorList, function ( index, value ) {

                    // Remove valid class, add error class, destroy existing tooltip,
                    // apply new tooltip options, and then explicitly show the tooltip.
                    $( value.element ) . removeClass( self.settings.validClass )
                                       . addClass( self.settings.errorClass )
                                       . tooltip( 'destroy' ) // Ensure old tooltip is removed before creating a new one.
                                       . tooltip( self.apply_tooltip_options( value.element, value.message ) )
                                       . tooltip( 'show' );

                    // If a highlight callback is defined in settings, execute it.
                    if ( self.settings.highlight ) {

                        self.settings.highlight.call( self,
                                                      value.element,
                                                      self.settings.errorClass,
                                                      self.settings.validClass );
                    }

                } ); // End of errorList iteration.

            }, // End of defaultShowErrors method definition.


            // Helper method to generate tooltip options for a given element and its validation message.
            apply_tooltip_options: function ( element, message ) {

                // Initialize options using data attributes on the element,
                // falling back to Bootstrap tooltip defaults if not specified.
                var options = {
                    // Controls whether the tooltip has a CSS fade transition effect.
                    animation: $( element ) . data( 'animation' ) || true,
                    // Allows HTML content within the tooltip.
                    html:      $( element ) . data( 'html' )      || false,
                    // Specifies the position of the tooltip (e.g., 'top', 'bottom', 'left', 'right').
                    placement: $( element ) . data( 'placement' ) || 'top',
                    // If a selector is provided, tooltip objects will be delegated.
                    selector:  $( element ) . data( 'animation' ) || false, // Note: Original code uses 'animation' data attribute here, preserving it.
                    // The actual content displayed in the tooltip. Falls back to the validation message.
                    title:     $( element ) . attr( 'title' )     || message,
                    // Defines how the tooltip is triggered. Forced to 'manual' for validation control.
                    trigger:   $.trim( 'manual ' + ( $( element ) . data( 'trigger' ) || '' ) ),
                    // Delay for showing and hiding the tooltip (in ms).
                    delay:     $( element ) . data( 'delay' )     || 0,
                    // Appends the tooltip to a specific element, useful for z-index issues.
                    container: $( element ) . data( 'container' ) || false
                }; // End of options object literal.


                // Merge element-specific tooltip options from validator settings, if available.
                // These options take precedence over data attributes.
                if ( this.settings.tooltip_options && this.settings.tooltip_options[ element.name ] ) {

                    $.extend( options, this.settings.tooltip_options[ element.name ] );
                }


                // Merge global tooltip options from validator settings, if available.
                // These options apply to all elements and are overridden by element-specific settings.
                if ( this.settings.tooltip_options && this.settings.tooltip_options[ '_all_' ] ) {

                    $.extend( options, this.settings.tooltip_options[ '_all_' ] );
                }

                // Return the final compiled tooltip options object.
                return options;

            } // End of apply_tooltip_options method definition.

        } // End of prototype object for $.validator.

    } ); // End of $.extend call for jQuery Validation.

} ( jQuery ) ); // End of Immediately Invoked Function Expression (IIFE).