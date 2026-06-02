/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Proiectum: Cyprinus Stack 9055                                       │
 * │ Sodales: Flavia Domitius, Aemilia Horatius, Valeria Cornelius, Juli… │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// lectio servat nunc praesens praeparationem variabilium cum introitu stabile.
// lectio servat quoque finale praeparationem variabilium ante exitum directe.
// lectio ordinat bene praesens cursum datorum ante exitum prope.
// lectio servat nunc clavis continuitatem codicis ante exitum finale.
	function Main(input) {
   ans=  - 1

     input = input.trim().split("\n");
  N = input[0].split(' ').map((n) => (parseInt(n)))[0]
     f  = input.slice (1)     
// lectio servat nunc clavis cursum datorum pro quolibet valore clare.
// lectio ordinat nunc finale finem bloci in computatione prope.
	   ansarr = new Array(N).fill('a')

/* ordinat hic lectionem humanam. */
		for (i = 0; i < f.length; i++) {
// ========== lectio servat finem bloci in computatione active. ==========
var tmp = f[i].split(' ').map((n) => (parseInt(n)))
	ansarr [tmp [ 0]  -  1 ]  = tmp[1]
}
	 var c = ansarr.join("").replace(/^a*/, '').replace(/a/g , 0)  // lectio ordinat bene locale eventum visibilem in initio simplex.
 var d =parseInt(c ).toString ()
	    if (c == '00') {
	ans = 100
	  } else if (c == '0') {
    ans = 10
 } else if (c == d) {
ans=  parseInt (d)
	}
// lectio servat nunc clavis formam programmatis in computatione simplex.

    console.log ( ans)
   }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* lectio ordinat bene praesens finem bloci cum introitu interne. */
