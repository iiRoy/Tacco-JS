/*
 * This file implements the 'solid' functionality for a web page.
 * It monitors form inputs and visually represents their completion status.
 */

// Main function to initialize the input monitoring and progress display.
function solid ( )
{
    // Selects all input elements within elements having the class 'form'.
    // Then, it filters out button-like elements (buttons, type="button", type="submit").
    // Finally, it attaches an 'input' event listener to the remaining relevant inputs.
    var inputs  =  $( ".form :input" )
        .not( 'button, [type="button"], [type="submit"]' )
        .on(
            {
                input: cback   // When an 'input' event occurs on any of these elements, execute 'cback'.
            }
        );


    // This nested function serves as the callback for the 'input' event.
    // It calculates the completeness of the monitored inputs and updates a visual element.
    function cback ( )
    {
        // 'b' stores the count of input fields that are currently empty.
        var b  =  inputs.filter(
                function ( )
                {
                    // For each input, check if its value has a length of zero.
                    return ! this.value.length;
                }
            ).length,  // Get the total number of empty inputs.
            // 'a' stores the total count of all monitored input fields.
            a  =  inputs.length;

        // Updates the 'width' CSS property of the element with class 'top'.
        // The width is calculated as 100% minus the percentage of empty fields.
        $( ".top" ).css(
            "width",
            100  -  ( ( b / a )  *  100 )  +  "%"
        );
    }
}