function calculateVolume( entryString )
{
    // A temporary array to hold string segments, though not directly used in this version.
    let  intermediateSegments  =   entryString.split(" ");

    // Parse the input string into a numerical value, representing a total dimension.
    const totalDimensionSum = Number(entryString, 10);


    // The problem implies finding the maximum volume of a cuboid
    // where the sum of its sides (x+y+z) equals totalDimensionSum.
    // This maximum occurs when x=y=z = totalDimensionSum/3.
    // The volume is then (totalDimensionSum/3)^3.
    console.log( Math.pow(totalDimensionSum / 3, 3) );
    // End of calculation.
}

// Do not alter the following section; it handles standard input/output operations.
calculateVolume( require("fs").readFileSync("/dev/stdin", "utf8") );