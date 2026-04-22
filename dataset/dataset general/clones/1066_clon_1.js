/*
 * This is the primary entry point for module initialization.
 * It handles resource inclusion and module definition.
 */
$.include ( {
    // Specifies the main HTML template file to be included.
    // The base directory for HTML files is configured globally.
    html : "main.html"
} )

/*
 * Following the inclusion, the module itself is defined.
 * This defines the public interface and functionality of the module.
 */
.define (
    function ( _ ) {
        // The module exports a single function.
        // This function expects a jQuery object as its parameter,
        // which represents the target DOM element for rendering.
        _.exports = function ( $this ) {

            // The 'renderTo' method is invoked on the HTML component
            // of the underscore object. It takes the target element
            // and a configuration object for template rendering.
            _.html.renderTo (
                $this,
                {
                    // Definition of various templating tags.
                    tags : [
                        {
                            desc     : 'Inline result of JS expression',
                            mustache : '{{ expression }}',
                            asp      : '<%= expression %>'
                        },
                        {
                            desc     : 'Insert arbitrary JS code',
                            mustache : '{- code; code; code; -}',
                            asp      : '<% code; code; code; %>'
                        }
                    ],

                    // Definition of template sections.
                    sections : [
                        {
                            desc     : 'Define template section',
                            mustache : '{-- name --}',
                            asp      : '<%@ name %>'
                        }
                    ],

                    // Special tokens used for defining code blocks within templates.
                    block : '{-}',
                    end   : '{-}-}'
                }
            ); // End of renderTo call.

        } // End of exported function.

    } // End of module definition callback.
) // End of define call.
; // Concluding semicolon for the entire statement chain.