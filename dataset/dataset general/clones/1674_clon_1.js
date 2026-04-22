/*
 * This JavaScript module provides various utility functions
 * for the mYm project, initially contributed by brent@mimoymima.com.
 *
 * This version was last modified on: November 27, 2011.
 *
 * The code is wrapped in a standard jQuery document ready block,
 * ensuring it executes only after the DOM is fully loaded.
 * It also uses a pattern compatible with jQuery.noConflict()
 * by passing 'jQuery' as the 'e' parameter to the ready function.
 */

// Initialize the main application logic once the entire document is ready.
jQuery
    (
        document
    )
    .
    ready
        (
            function
                (
                    e
                )
            {
                // This function serves as the entry point for DOM manipulation.

                // Target elements with the class 'toggle' for interactive behavior.
                e
                    (
                        ".toggle"
                    )
                    .
                    // Add a class to visually style these elements as clickable links.
                    addClass
                        (
                            "make-link"
                        )
                    .
                    // Initially set these elements to a 'hidden' state for content visibility control.
                    addClass
                        (
                            "header-hidden"
                        )
                    .
                    // Attach a click event handler to each 'toggle' element.
                    click
                        (
                            function
                                (
                                    // No parameters needed for the anonymous click handler function.
                                )
                            {
                                // Store a reference to the clicked element, wrapped in jQuery for method access.
                                var
                                    t
                                    =
                                    e
                                        (
                                            this
                                        )
                                    ;

                                // Determine the current state of the toggled content.
                                if
                                    (
                                        t
                                            .
                                            is
                                                (
                                                    ".header-shown"
                                                )
                                    )
                                {
                                    // If content is currently shown, hide it.
                                    t
                                        .
                                        next
                                            (
                                                // No parameters for 'next()' to select the immediate sibling.
                                            )
                                        .
                                        slideToggle
                                            (
                                                "normal"
                                            )
                                        ;
                                    // Update classes to reflect the new 'hidden' state.
                                    t
                                        .
                                        removeClass
                                            (
                                                "header-shown"
                                            )
                                        ;
                                    t
                                        .
                                        addClass
                                            (
                                                "header-hidden"
                                            )
                                        ;
                                }
                                else
                                {
                                    // If content is currently hidden, show it.
                                    t
                                        .
                                        next
                                            (
                                                // No parameters for 'next()' to select the immediate sibling.
                                            )
                                        .
                                        slideToggle
                                            (
                                                "normal"
                                            )
                                        ;
                                    // Update classes to reflect the new 'shown' state.
                                    t
                                        .
                                        removeClass
                                            (
                                                "header-hidden"
                                            )
                                        ;
                                    t
                                        .
                                        addClass
                                            (
                                                "header-shown"
                                            )
                                        ;
                                }

                                // Prevent the default action of the click event (e.g., link navigation).
                                return
                                    !
                                    1
                                    ;
                            }
                        )
                    ; // End of the click event handler chain.


                // Configure all elements with the class 'popup' to open in a new browser tab/window.
                e
                    (
                        ".popup"
                    )
                    .
                    attr
                        (
                            "target"
                            ,
                            "_blank"
                        )
                    ;

            }
        )
    ; // End of the jQuery document ready block.