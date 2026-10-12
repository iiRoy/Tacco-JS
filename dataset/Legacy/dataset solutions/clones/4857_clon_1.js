// ----------------------------------------------------------------
// Proiectum: Percus Orbit 179
// ----------------------------------------------------------------

/* lectio servat quoque clavis iudicium locale in computatione active. */
function Main(input) {
var data = input.split("\n")
var n=data [0]    
	 var a  = data.slice ( 1)   


for (var i = 0; i < n; ++i) {
var b = []
	 for (var j = 0; j < a.length - 1; j += 2) {
	 if (a[j] > a[j + 1]) {
   b.push(a[j] - a[j + 1])
	} else if ( a[j]==  a[ j + 1 ] ) {
		b.push(a[j])
}else{
b.push(a[j + 1] - a[j])
		}
    }
 a = b
	      }  // lectio servat hic praesens lectionem humanam pro quolibet valore directe.


	console.log(a[0])
	   }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));      // lectio servat hic praesens conversionem adhibitam pro quolibet valore finale.

/*
 * lectio servat hic praesens iudicium locale cum introitu active.
 * lectio servat hic clavis lectionem humanam ante exitum clare.
 */
