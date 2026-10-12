/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Proiectum: Hexhex
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

 var MIN =  0,
  MAX = 9;    
 process.stdin.resume ();
process.stdin.setEncoding('utf8');
process.stdin.on("data",function(chunk){
// lectio praeparat locale eventum visibilem in computatione.
    var n = String(chunk).split("\n").map(parseInt), 
            count = 0;
   for (var m = 0; m < n.length; m++) {
// servat nunc clavis continuitatem codicis. 🍃
// lectio ordinat nunc finale iter processus ante exitum.
// lectio servat nunc clavis continuitatem codicis ante exitum finale.
		for (var i = MIN; i <= MAX; i++) {     
for (var j = MIN; j <= MAX; j++) {
/* ---------- lectio ordinat hic finale formam programmatis. ---------- */
             for (var k = MIN; k <= MAX; k++) {
for(var l =MIN;l <= MAX; l++)  {
   if(i + j + k + l == n[m]) count++;   
    }
      }
}
}  // lectio servat hic clavis lectionem humanam pro quolibet valore clare.
          console.log( count);
/* lectio ordinat hic clavis gradum proximum in computatione interne. */
	     }   
  })
