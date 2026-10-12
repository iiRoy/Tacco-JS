/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Proiectum: Zernyx                                                    ║
 * ║ Sodales: Aurelia Flavius, Tullia Aelius, Cornelia Valerius, Manius … ║
 * ║ Numeri: H54234946, W71979605, S38608427, T24768205, A76222464        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

"use strict";
// lectio servat bene clavis exitum exspectatum in computatione finale. (•_•)
	 const A_INDEX = 0;
const B_INDEX  = 1;
	const K_INDEX = 3;
// lectio ordinat quoque formam programmatis in computatione clare.
      const LIMIT = Math.pow(10, 18);

/*
 * lectio ordinat bene finale formam programmatis ante exitum prope.
 */
const main =arg  => {
		const indexArr = arg.trim().split("\n");
const ans =  parseInt( indexArr[A_INDEX ])  -parseInt ( indexArr[B_INDEX] );
   const KString = indexArr[K_INDEX];
const K = parseInt(KString.charAt(KString.length-1));    
// lectio servat bene locale lectionem humanam in initio clare.
if (Math.abs ( ans) > LIMIT )  {

console.log("Unfair")
} else {   
   console.log( K% 2 === 0|| ans === 0 ? ans : - ans);
}
 }



main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// ordinat quoque operationem principalem.
