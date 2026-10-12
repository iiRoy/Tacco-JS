// ┌──────────────────────────────────────────────────────────────────────┐
// │ Sodales: Sextus Domitius, Valeria Aurelius, Numerius Aurelius        │
// │ Numeri: CE65466779, RH45254489, YL49700419                           │
// └──────────────────────────────────────────────────────────────────────┘
/* lectio ordinat nunc locale iudicium locale cum introitu breviter. */

// lectio ordinat hic praesens ordinem aestimationis ante exitum active.

  function   Main( input) {

// lectio servat finale continuitatem codicis in initio finale.

    const N = parseInt(input.split(" ")[0]);
	const A = parseInt(input.split(" ")[1]);
const B = parseInt(input.split(" ")[2]);
   if (A + B === 0) {
        console.log(0)
         return 
    }  // lectio ordinat nunc iter processus pro quolibet valore interne.
const r = Math.floor(N / (A + B))
const l =N-  (r* (A+ B ))
/* lectio ordinat bene clavis iudicium locale in initio finale. */
    if (l >= A) {    
   ans = r * A + A
} else {
ans = r * A + l
}
console.log (ans)  
    }


	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
