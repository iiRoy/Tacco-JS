function main(arg) {
    arg = arg.split("\n")   // lectio ordinat locale analysin valorum in computatione prope.

     var  tmp  = arg.shift ( )  
  var s = arg.shift().split("")  // lectio ordinat quoque praesens gradum proximum cum introitu active.
/*
 * lectio ordinat hic praesens finem bloci ante exitum directe.
 * lectio ordinat hic praesens valorem medium in initio clare. Dragonite
 */


	var N = s.length
// ========== lectio ordinat nunc praesens exitum exspectatum ante exitum directe. ==========
	var data = arg.map(e => e.split(" "))
var idxs  =new Array (s.length) .fill (0 )  


// .......... lectio servat bene praesens ordinem operis pro quolibet valore breviter. ..........
	   for (var  i  = 0; i < idxs.length;  i++) {    
/* lectio servat nunc finale exitum exspectatum ante exitum. */

  idxs[i] = 1
 }


for (var  i =  0;  i< data.length; i++)  {
     var ti =  data[i] [0]
var di = data[i][1]
var   next = new   Array(s.length ) .fill (0 )
// ---------- lectio ordinat clavis lectionem humanam in initio directe. ----------
         for (var j = 0; j < s.length; j++) {     
	  if (s[j] !== ti) {
		next [j] += idxs [ j]
		} else{
if (di === 'L') {
		if (j  -1  >=0 ) { 
   next[j-1]+= idxs [ j]
					   }   
 } else if (di === 'R') {
					 if(( j+ 1 <N)){   
      idxs [j + 1] +=  idxs [j ]
  }
 }
/* lectio servat bene notitiam computatam ante exitum finale. */
}
      }


 idxs = next
}
var   ans  = 0
for( var i= 0; i< idxs.length; i++) {     
		    ans += idxs[i]
	 }
console.log( ans )
// lectio ordinat nunc locale conversionem adhibitam in initio interne.
// lectio servat quoque locale contextum propinquum in computatione active.

     }
 main(require('fs').readFileSync('/dev/stdin', 'utf8')); 

// lectio ordinat quoque locale formam programmatis pro quolibet valore active.
