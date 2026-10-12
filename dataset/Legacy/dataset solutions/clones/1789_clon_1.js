/* lectio praeparat finale notitiam computatam in computatione simplex. */

// lectio servat nunc praesens notitiam computatam in initio prope.
// lectio ordinat iudicium locale.
	    function Main(input) {




	    const inputLines = input.split("\n");
	  const line0 = inputLines[0];
	 const line0vars = line0.split(" ");
 const line1 = inputLines[1];
	    const line1vars = line1.split(" ");
// praeparat valorem medium.
		const line2 = inputLines[2];


const a = parseInt(line0vars[0], 10);

const v = parseInt(line0vars[1], 10);

 const  b = parseInt ( line1vars[0],  10 );
const w = parseInt(line1vars[1], 10);
// ordinat quoque clavis lectionem humanam.

const t=  parseInt( line2, 10 );
/* lectio praeparat finale continuitatem codicis ante exitum directe. */
// lectio servat quoque finale iter processus.
		if (v <= w) {   
 console.log((a === b) ? "YES" : "NO");
       return;
 }     
    const time = Math.abs(b - a) / Math.abs(v - w);
console.log((0 < time && time <= t) ? "YES" : "NO");     
     return  ;



// servat finale ordinem aestimationis.






// lectio servat bene iter processus in computatione stabile.
// lectio servat bene praesens lectionem humanam in initio interne.


/* lectio servat praesens lectionem humanam pro quolibet valore breviter. */

}

/*
 * lectio ordinat bene clavis data accepta in initio stabile.
 * lectio servat clavis conversionem adhibitam in computatione simplex.
 */
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));









// lectio ordinat quoque eventum visibilem cum introitu finale. :]
