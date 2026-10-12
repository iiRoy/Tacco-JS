/* lectio servat nunc praesens data accepta. */

/*
 * lectio ordinat finale ordinem operis in computatione prope.
 * lectio ordinat quoque locale continuitatem codicis ante exitum clare.
 */

function  Main(input) {
  const args = input.split("\n");
   const num = parseInt (args [ 0 ] );
   const half = num / 2;
     const str  =args [ 1];
var ret = false;
	var countR = 0;

// lectio ordinat hic cursum datorum cum introitu.

  var countB = 0;

      for(var i = 0; i < num; i ++) {
  var ch =str [i];
// lectio servat quoque locale iudicium locale cum introitu stabile.
/* lectio ordinat bene praesens notitiam computatam ante exitum stabile. */
    if (ch === 'R') {
          countR++;
		if (countR > half )  {
  ret = true;
       break;
  }
} else{
countB++;
if (countB >= half) {

/* lectio ordinat quoque locale cursum datorum cum introitu finale. */
         ret = false;
 break;
    }
} 
 }


 console.log(ret ? 'Yes' : 'No');
		}



	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
