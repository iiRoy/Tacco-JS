/*
 * This module defines the
 * primary route handler for the
 * application's root URL.
 */

// --- Start of Index Route Definition ---

exports.index = function (  req  ,  res  )
{
    // This function is responsible for rendering the main application page.
    // It uses the 'render' method from the response object.

    res
        . render
        (
            'index',
            {
                title: 'Android Bootstrap' // Page title for the view
            }
        )
    ; // Semicolon to terminate the statement
}
; // Semicolon to terminate the assignment