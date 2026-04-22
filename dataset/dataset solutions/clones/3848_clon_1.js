/*
 * This script processes a single line of input,
 * typically representing a month and a day.
 * It calculates a specific day count based on the input.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

//  Import the 'readline' module to handle input from the console.
var     reader          =    require('readline')
                            .createInterface
                                ({
                                        input   : process.stdin,    //  Standard input stream
                                        output  : process.stdout    //  Standard output stream
                                })
        ;   //  End of reader initialization

//  Event listener for each line of input received.
reader  .on (   'line',

    //  Anonymous function to process the received line.
    function    (   line    )
    {
        //  Pass the input line to the showInput function for processing.
        showInput   (   line    )
    }

);  //  End of 'line' event handler

/**
 * Processes the input line to calculate a specific day count.
 * @param {string} line - The input line containing month and day values.
 */
function    showInput   (   line    )
{
    //  Split the input line by space to get individual string values.
    var inputs  =   line    .split  (   ' ' )
    ;

    //  Parse the first input as the month.
    var month   =   parseInt    (   inputs  [   0   ]   )
    ;

    //  Parse the second input as the day.
    var day     =   parseInt    (   inputs  [   1   ]   )
    ;

    //  Initialize a counter for Takahashi's special days.
    var takahashiDayCount   =   0
    ;


    //  Validate the input month and day.
    //  Month must be between 1 and 12, inclusive.
    //  Day must be between 1 and 31, inclusive.
    if  (
            month   <=  0
            ||      month   >   12
            ||      day     <=  0
            ||      day     >   31
        )
    {
        //  If validation fails, return the initial (zero) count.
        return  console .log   (   takahashiDayCount   )
        ;
    }


    /*
     * Loop through months, decrementing from the input month down to 1.
     * This loop simulates checking each month from the given month back to January.
     */
    for (   month   ;
            month   >   0   ;
            month   --      )
    {
        //  If the current month number is less than or equal to the input day,
        //  it is considered one of Takahashi's special days.
        if  (   month   <=  day   )
        {
            //  Increment the counter for special days.
            takahashiDayCount   ++
            ;
        }
    }


    //  Output the final calculated count to the console.
    return  console .log   (   takahashiDayCount   )
    ;
}