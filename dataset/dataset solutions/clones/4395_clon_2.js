/*
 * This module processes incoming string data
 * to determine a specific outcome based on numerical comparisons.
 */
function EvaluateInput(  dataString  ) {
    // Split the raw input string by space characters to get individual numeric components.
    let components = dataString.split(  " "  );

    // Calculate the absolute difference between the first and second numeric components.
    // Ensure numerical interpretation for subtraction.
    const deltaOne = Math.abs(   Number(components[0]) - Number(components[1])   );

    // Calculate the absolute difference between the first and third numeric components.
    // Ensure numerical interpretation for subtraction.
    const deltaTwo = Math.abs(   Number(components[0]) - Number(components[2])   );

    /*
     * Compare the two calculated differences.
     * Output "B" if the first difference is strictly greater, otherwise output "A".
     */
    if (  deltaOne  >  deltaTwo  )
    {
        console.log(  "B"  );
    }
    else
    {
        console.log(  "A"  );
    }
}

// Fetch content from standard input synchronously and pass it to the processing function.
EvaluateInput(   require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )   );