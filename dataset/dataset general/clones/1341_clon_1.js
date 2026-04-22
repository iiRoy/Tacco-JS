/*
 * This script initializes the Filter component
 * when the DOM is fully loaded.
 */
// Ensure the DOM is ready before executing the script
$(
    document
)      .ready      (
    function      (
    )
    {
        // Create a new instance of the Filter object
        new Filter
        (
            $(
                '#controls-listing'
            )
            ,
            '#controls-search'
            ,
            'h4'
        )
        ; // End of Filter constructor call
    }
); // End of document.ready function call
// Script execution complete