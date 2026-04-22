$( function ( ) {

    /*
     * Initialize counter for dynamic input fields.
     * This variable tracks the number of items currently in the '.inputs' container.
     */
    var i = $( '.inputs input' ) .size( ) + 1 ;


    /*
     * Helper function to display temporary alert messages.
     * It first removes any existing alerts before adding a new one.
     * @param {string} message - The text content of the alert.
     */
    function showAlert ( message ) {

        $( '#alerts' ) . remove( ) ; // Clear any previously displayed alerts
        $( '#answers-wrapper' ) . append ( "<div id='alerts'>" + message + "</div>" ) ;

    } ;


    /**
     * Calculates the sum of all numerical values entered into '.field' elements.
     * Iterates through each field and converts its value to a number for summation.
     * @returns {number} The total sum of all field values.
     */
    function fieldsTotal ( ) {

        var add = 0 ;

        $( ".field" ) . each ( function ( ) {

            add += Number ( $( this ) . val ( ) ) ;

        } ) ;

        return add ;

    } ;


    /*
     * Event handler for keyup events on input fields within the '.inputs' container.
     * This function dynamically updates the 'pixels left' display based on
     * the sum of input values and a predefined navigation width.
     */
    $( '.inputs' ) . on ( 'keyup' , 'input' , function ( ) {

        var nav_width = $( '#nav-width' ) . val ( ) ; // Retrieve the total navigation width
        var sumOfVals = 0 ;

        $( '.inputs input' ) . each ( function ( ) {

            // Only consider fields that actually have a value entered by the user
            if ( this . value != '' ) {

                sumOfVals = sumOfVals + parseInt ( $( this ) . val ( ) ) ;

            } ;

        } ) ;


        // Check if the current sum of item widths exceeds the allowed navigation width
        if ( sumOfVals > nav_width ) {

            alert ( "You are over your pixel width limit" ) ; // Inform the user about the overflow
            $( '.nav-item:last .field' ) . val ( "" ) ; // Clear the last entered value to correct

        }
        else {

            sumOfVals = nav_width - sumOfVals ; // Calculate remaining pixels
            $( '#px-left em' ) . html ( sumOfVals ) ; // Update the display

        }

    } ) ;


    /*
     * Keyup event listener for the main navigation width input field.
     * Updates the 'pixels left' display immediately with the entered navigation width.
     */
    $( '.input' ) . on ( 'keyup' , 'input' , function ( ) {

        var nav_width = parseInt ( $( this ) . val ( ) ) ; // Get the new navigation width
        $( '#px-left em' ) . html ( nav_width ) ; // Reflect this value in the 'pixels left' indicator

    } ) ;



    // Event handler for the 'Add' button click
    $( '#add' ) . click ( function ( ) {

        // First, check if adding a new item would exceed the navigation width limit
        var add = fieldsTotal ( ) ; // Get the current total of all item widths
        var nav_width = $( '#nav-width' ) . val ( ) ; // Retrieve the maximum allowed width
        var sumOfVals = 0 ; // This variable is declared but not used here, consider removal or use.


        if ( add > nav_width )
        {
            // If total exceeds limit, show an alert and clear the last field
            showAlert ( 'This is greater than your navigation width. Try again, you may be a few pixels over the total width.' ) ;
            $( '.nav-item:last .field' ) . val ( "" ) ;
        }
        else
        {
            // If within limits, remove any previous alerts and add a new navigation item input field
            $( '#alerts' ) . remove ( ) ;
            $( '<div class="nav-item"><label for="' + i + '">' + i + '</label><input type="text" class="field" name="dynamic[]" placeholder="Navigation item width" value="" pattern="[0-9]*"><span class="px">px</span></div>' ) . fadeIn ( 'slow' ) . appendTo ( '.inputs' ) ;
            i ++ ; // Increment the counter for the next item

        }

        $( '.nav-item:last .field' ) . focus ( ) ; // Set focus to the newly added field for immediate input
        return false ; // Prevent default button action

    } ) ;



    /*
     * Handles the 'Remove' button click event.
     * Removes the last dynamically added navigation item if there is more than one item.
     */
    $( '#remove' ) . click ( function ( ) {

        if ( i > 1 ) { // Ensure at least one item remains (the initial one)

            $( '.nav-item:last' ) . remove ( ) ; // Remove the last navigation item
            i -- ; // Decrement the item counter

        } ;

        $( '#alerts' ) . remove ( ) ; // Clear any active alerts
        $( '#answers' ) . remove ( ) ; // Clear any previous answers display
        return false ; // Stop default action

    } ) ;


    /*
     * Event listener for the 'Reset' button.
     * Resets the form by removing all dynamically added navigation items,
     * leaving only the initial two items.
     */
    $( '#reset' ) . click ( function ( ) {

        while ( i > 2 ) { // Keep the first two default items

            $( '.nav-item:last' ) . remove ( ) ; // Remove items from the end
            i -- ; // Update the counter

        } ;

        $( '#alerts' ) . remove ( ) ; // Clear alerts
        $( '#answers' ) . remove ( ) ; // Clear answers
        return false ; // Prevent form submission

    } ) ;


    /*
     * Handles the 'Submit' button click for input fields of type 'button'.
     * Calculates percentages of individual item widths relative to the total navigation width.
     */
    $( 'input[type=button]' ) . click ( function ( ) {

        // Initialize an empty array to store calculated percentage values for each field
        var answers = [ ] ;
        // Get the value of the navigation width input field
        var nav_width = $( '#nav-width' ) . val ( ) ;
        // Initialize a variable to accumulate the total percentage sum
        var sum = 0 ;


        // Iterate over each element with the class 'field'
        $. each ( $( '.field' ) , function ( ) {

            a = nav_width ; // Assign navigation width to 'a'
            b = $( this ) . val ( ) ; // Get the current field's value, assign to 'b'
            c = b / a ; // Calculate the ratio of field value to navigation width
            d = parseFloat ( c * 100 ) ; // Convert ratio to percentage, ensuring float
            sum += parseFloat ( d ) ; // Add current percentage to the total sum
            answers . push ( d ) ; // Store the individual percentage in the 'answers' array

        } ) ;


        // Display the total calculated percentage width
        $( '#total-perc-width em' ) . html ( sum ) ;


        // Re-check if the total of all nav items exceeds the navigation width
        var add = fieldsTotal ( ) ;

        if ( add > nav_width )
        {
            // If it exceeds, show an error and clear the last field's value
            showAlert ( 'This is greater than your navigation width. Try again, you may be a few pixels over the total width.' ) ;
            $( '.nav-item:last .field' ) . val ( "" ) ;
        }
        else
        {
            // If within limits, clear previous alerts and answers
            $( '#alerts' ) . remove ( ) ;
            $( '#answers' ) . remove ( ) ;

            // Check for empty input conditions
            if ( answers == 0 || nav_width == '' ) {

                showAlert ( 'Please enter a value to be calculated.' ) ; // Prompt user for input

            }
            else
            {
                // If valid inputs, display the calculated percentages
                $( '#answers-wrapper' ) . append ( "<div id='answers'>" + answers . join ( "<br>" ) + "</div>" ) ;

            } ;

        } ;

        return false ; // Prevent the default form submission behavior

    } ) ;

} ) ;