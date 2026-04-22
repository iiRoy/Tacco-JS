/*
 *  This file contains a helper registration for the Blaze templating engine.
 *  The helper converts Markdown formatted content into HTML.
 *
 *  It relies on the 'templating', 'htmljs', and 'blaze' packages.
 */

// Check if the 'templating' package is available in the current environment.
// This is a primary dependency for defining templates and helpers.
if
    (
        Package
            .
        templating
    )
{

    // Declare and initialize the 'Template' variable from the 'templating' package.
    var
        Template
        =
        Package
            .
            templating
            .
            Template
        ;


    /*
     *  Declare and initialize the 'HTML' variable.
     *  This object provides utilities for working with HTML,
     *  such as creating raw HTML content.
     *  It's typically part of the 'htmljs' package.
     *  (often implied by 'ui' package inclusion)
     */
    var HTML = Package.htmljs.HTML ; // Utility for HTML manipulation.


    // Declare and initialize the 'Blaze' variable from the 'blaze' package.
    // Blaze is the reactive UI rendering library for Meteor.
    var
        Blaze
        =
        Package
            .
            blaze
            .
            Blaze
        ; // The core rendering engine.


    // Register a new helper function named 'markdown' with the Blaze engine.
    // This helper will be accessible within Blaze templates.
    Blaze
        .
        registerHelper
        (
            'markdown', // The name of the helper.
            Blaze
                .
                Template
                (
                    'markdown', // Internal name for the template created for the helper.
                    function
                        (
                            /* No arguments expected for this helper function directly. */
                        )
                    {
                        // 'this' context refers to the current view instance in Blaze.
                        var
                            view
                            =
                            this
                            ;

                        // Initialize a variable to hold the content to be processed.
                        var content = '' ;

                        // Check if the current view has a content block provided.
                        // A content block is typically what's passed between `{{#markdown}}...{{/markdown}}`.
                        if
                            (
                                view
                                    .
                                    templateContentBlock
                            )
                        {
                            // If a content block exists, convert it to plain text.
                            // This ensures the markdown parser receives a string.
                            content =
                                Blaze
                                    .
                                    _toText
                                    (
                                        view
                                            .
                                            templateContentBlock, // The content block to convert.
                                        HTML
                                            .
                                            TEXTMODE
                                            .
                                            STRING // Specify that the output should be a string.
                                    )
                                ;
                        }

                        // Process the content using the 'marked' library
                        // (assuming 'marked' is globally available or imported elsewhere).
                        // Then, wrap the resulting HTML in HTML.Raw to prevent Blaze from escaping it.
                        return
                            HTML
                                .
                                Raw
                                (
                                    marked
                                        (
                                            content
                                        )
                                )
                            ;
                    }
                )
        )
    ;

} // End of the conditional block for Package.templating.

// Additional comments can go here, outside the main block.
/*
 * This structure ensures that the helper is only defined
 * if the necessary Meteor packages are loaded.
 */