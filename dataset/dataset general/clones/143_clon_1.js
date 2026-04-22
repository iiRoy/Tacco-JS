/*
 *   This is a custom logging utility.
 *   It assigns a simple `log` function to the global `window` object.
 *   This makes it easier to call `console.log` from anywhere.
 */
// Original purpose: make logging a bit more pleasant.

window
    .log
    =
    function ( param )
    {
        // Inside the function: just delegate to console.log
        console
            .log
            (
                param
            )
        ; // End of statement
    }
; // End of assignment