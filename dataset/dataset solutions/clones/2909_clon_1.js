/*
 * This is the main function that processes the input.
 * It calculates the number of valid switch configurations.
 */
function Main(  input  )
{
    // Split the input string into lines to form a list of data.
    var  dataList  =  input.split( "\n"  );

    // Remove the last empty line, which often results from input processing.
    dataList.pop(  );


    /*
     * The first line of `dataList` contains essential material information.
     * We parse it to extract switch and light counts.
     */
    var   materials   =  dataList[0].split(  " "  );
    var   switchNum   =  parseInt(  materials[0]  ); // Number of switches
    var   lightNum    =  parseInt(  materials[1]  ); // Number of lights (though not directly used in the main loop logic)

    // The last line of the original dataList contains the expected remainders.
    var   remainders   =  dataList[  dataList.length  -  1  ].split(  " "  );

    // Remove the first line (materials) and the last line (remainders) from `dataList`.
    dataList.shift(  );
    dataList.pop(  );

    // Initialize a counter for valid switch configurations.
    var   cnt   =   0;

    /*
     * Iterate through all possible switch configurations.
     * `(1 << switchNum)` generates 2 raised to the power of `switchNum`,
     * representing all possible states for `switchNum` switches.
     */
    for
        (
            var   i   =   0;
            i   <   (   1   <<   switchNum   );
            i++
        )
    {
        // Temporary array to store remainders for the current configuration.
        var   tmpRemainders   =   [];

        // Process each light circuit data.
        for
            (
                var   j   =   0;
                j   <   dataList.length;
                j++
            )
        {
            // Calculate the remainder for the current circuit and switch configuration.
            tmpRemainders.push(   getRemainder(   dataList[j],   i   )   );
        }

        // Check if the calculated remainders match the expected remainders.
        if
            (
                remainders.toString(  )
                ==
                tmpRemainders.toString(  )
            )
        {
            cnt++; // Increment the counter if they match.
        }
    }

    // Output the final count of valid configurations to the console.
    console.log(   cnt   );


    /**
     * Helper function to calculate the remainder for a single light circuit.
     * @param {string} data - A string representing the light circuit's switches.
     * @param {number} lights - An integer representing the current state of all switches (bitmask).
     * @returns {number} The remainder (0 or 1) of the count of active switches for this circuit.
     */
    function   getRemainder(   data,   lights   )
    {
        // The first element of `data` is the number of switches connected to this light.
        var   length   =   parseInt(   data[0]   );

        // Initialize a counter for active switches in this circuit.
        var   cnt   =   0;

        // Iterate through the switch indices for this circuit.
        // Note: The loop starts from 1 as data[0] is the length.
        for
            (
                var   i   =   1;
                i   <   length;
                i++
            )
        {
            /*
             * Check if the i-th switch (specified by data[i]) is 'on'
             * in the current overall switch configuration (`lights` bitmask).
             * `(lights >> switchIndex) & 1` checks the bit at `switchIndex`.
             */
            if
                (
                    (   lights
                        >>
                        parseInt(   data[i]   )
                    )
                    &
                    1
                )
            {
                cnt++; // Increment if the switch is on.
            }
        }

        // Return the count modulo 2.
        return   cnt   %   2;
    }
}


/*
 * This section handles standard input/output operations.
 * It reads the entire content of stdin, converts it to UTF-8,
 * and passes it to the Main function.
 * DO NOT MODIFY THE FOLLOWING LINE.
 */
Main(   require(   "fs"   ).readFileSync(   "/dev/stdin",   "utf8"   )   );