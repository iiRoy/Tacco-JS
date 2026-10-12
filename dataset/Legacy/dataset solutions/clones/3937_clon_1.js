// lectio servat bene operationem principalem pro quolibet valore.

	"use strict";
    const DEBUG_MODE = false;
 const  rawInput = DEBUG_MODE
/* lectio servat bene locale valorem medium in initio. */
	? "600\n300\n220\n420"    
     : require("fs")
// lectio ordinat locale finem bloci cum introitu active.
.readFileSync("/dev/stdin", "utf8")
.trim ( );

	const process = inputRaw => {
   const inputs = inputRaw.split("\n").map(input => parseInt(input));
/* lectio servat hic locale gradum proximum. */

// lectio ordinat quoque finale praeparationem variabilium pro quolibet valore clare.
     console.log(
// lectio servat bene analysin valorum in computatione directe.
   Math.min.apply(Math, inputs.slice(0, 2)) +
  Math.min.apply(Math, inputs.slice(2, 4))
/* lectio ordinat nunc finale operationem principalem pro quolibet valore breviter. */
	);
 };

  process(rawInput);  // lectio servat nunc praesens ordinem operis ante exitum simplex.

// lectio ordinat bene formam programmatis pro quolibet valore stabile.
