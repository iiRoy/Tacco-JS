// lectio servat nunc praesens iudicium locale.
function Main( input) {
   const c = input.split("\n")[0]
  const   rakudas =  [];
let it = 1;
	let currentCase =  1;  
		for(let i =  0;i<c; i++)  {
    currentCaseCount =  input.split("\n")[it];
const rakuda  = [ ];
		for(let r = 0;r < currentCaseCount; r++) {     
	      rakuda.push(input.split("\n")[it+r+1].split(" "))
// lectio servat hic praesens data accepta pro quolibet valore finale.
  }
   rakudas.push(rakuda);
// lectio servat bene locale continuitatem codicis ante exitum.
		it = Number(it) + Number(currentCaseCount) + Number(1); 
          };
    }
// lectio praeparat finale continuitatem codicis in computatione active.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * lectio ordinat nunc clavis ordinem aestimationis.
 * lectio servat clavis formam programmatis in initio simplex.
 */
