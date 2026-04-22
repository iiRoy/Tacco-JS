/*
 * Module responsible for processing numerical input
 * and deriving fundamental geometric properties of a circle.
 */
function computeCircleStats(rawEntry) {
  // Convert the incoming textual representation to an integer value.
  rawEntry = parseInt( rawEntry );

  // Output both the area (π * r * r) and the circumference (2 * π * r)
  // using the standard Math.PI constant and the processed radius.
  console.log( "%d %d", Math.PI * rawEntry * rawEntry, Math.PI * 2 * rawEntry );
}


// Initiate the primary calculation process.
// The numerical radius for the circle is retrieved from a local data file.
computeCircleStats( require("fs").readFileSync("b.txt", "utf8") );