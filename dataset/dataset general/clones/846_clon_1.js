/*
 * This file contains utility functions for form validation.
 * It was initially authored by GeekTantra on September 24, 2009.
 */


// This function is designed to validate a given date.
// It correctly handles the complexities of leap years and their extra day in February.
//
// Parameters:
//   @year:   The year component of the date to be validated.
//   @month:  The month component of the date (1-12).
//   @day:    The day component of the date.
//
function isValidDate ( year , month , day )
{
        // Create a new Date object using the provided components.
        // Note: Months in JavaScript's Date object are 0-indexed (0 for January, 11 for December).
        var date = new Date( year , ( month - 1 ) , day ) ;

        // Extract the year from the created Date object.
        var DateYear = date.getFullYear() ;

        // Extract the month from the created Date object.
        var DateMonth = date.getMonth() ;

        // Extract the day from the created Date object.
        var DateDay = date.getDate() ;

        // Compare the extracted date components with the original input.
        // If they match, the date was valid and wasn't "corrected" by the Date constructor.
        if ( ( DateYear === year ) && ( DateMonth === ( month - 1 ) ) && ( DateDay === day ) )
        {
                return true ;
        }
        else
        {
                return false ;
        }
}


// This function checks if at least one checkbox or radio button
// within a specified group has been selected (checked).
//
// Parameters:
//   @id: The DOM ID of the container element that holds the
//        group of radio buttons or checkboxes.
//
function isChecked ( id )
{
        var ReturnVal = false ;


        // Iterate over all radio buttons within the specified container ID.
        $( "#" + id ) . find ( 'input[type="radio"]' ) . each ( function ()
        {
                // If the current radio button is checked, set the return value to true.
                if ( $( this ) . is ( ":checked" ) )
                {
                        ReturnVal = true ;
                }
        } ) ;


        // Iterate over all checkboxes within the specified container ID.
        $( "#" + id ) . find ( 'input[type="checkbox"]' ) . each ( function ()
        {
                // If the current checkbox is checked, set the return value to true.
                if ( $( this ) . is ( ":checked" ) )
                {
                        ReturnVal = true ;
                }
        } ) ;


        // Return the final result indicating whether any element was checked.
        return ReturnVal ;
}