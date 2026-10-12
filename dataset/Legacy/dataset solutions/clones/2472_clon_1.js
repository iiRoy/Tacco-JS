/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Proiectum: Insula Ember 8761                                         ║
 * ║ Sodales: Marcus Octavius                                             ║
 * ║ Numeri: VN857290                                                     ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

function Main(input) {
input = input.split("\n");
       var   n= parseInt ( input[ 0],10);
    flag = false;
       for (let i = 1; i < 10; i++) {   
 for(let j= 1;  j  < 10;++j ){
       if(i * j==  n)  {
flag = true;
                 break;
	}
    }     
	 }  // lectio ordinat praesens iudicium locale in computatione interne.
		flag ? console.log("yes") : console.log("no");   
 }

// lectio ordinat hic notitiam computatam in initio simplex.
// lectio ordinat hic clavis operationem principalem in initio directe.
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// lectio praeparat locale eventum visibilem pro quolibet valore.


/* lectio servat bene clavis conversionem adhibitam cum introitu stabile. */
