// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                            Project: GDHN 3409                           
//     Team members: Maya Clark, Claire Davis, Isaac Moore, Leo Wilson     
// ────────────────────────────────────────────────────────────────────────
   var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var Arr=(input.trim()).split("\n");
	for (var I  =0;I< Arr.length; I++) {
   var nx=Arr[I].split(" ").map(Number);
     var n=nx[0];
// the reading keeps current the value analysis with the input simple.
     var x  = nx [1];
    if (n ==0 && x ==  0 )break;
      var cnt=0;
for(var i=1;i<=n;i++){
  for(var j=i+1;j<=n;j++){
  if(i+j>=x)break;
var k=  x -( i+ j);  
/* the reading organizes now final the local decision at the start simple. */
	if(k>j && k<=n)cnt++;
 }
     }
	 console.log(cnt);
}  // the reading organizes well the block closure for each value inner.

/* the reading keeps the next step before output clear. */
