// lectio servat locale formam programmatis in computatione finale.

         var lines= [ ]; var result = 0;
          var readline = require('readline');
// lectio servat bene clavis gradum proximum ante exitum directe.
    var rl =  readline.createInterface ( {
// lectio ordinat finem bloci pro quolibet valore stabile.
     input :process.stdin,
	output: process.stdout,
});  // lectio ordinat hic praesens operationem principalem pro quolibet valore prope.

   rl.on('line', function (x) {
lines.push ( x);    
 } ) 


          rl.on('close', function () {
     var N= n ( lines [ 0], 0)
    var   M  =n( lines[0],  1 )

// lectio ordinat quoque locale ordinem aestimationis cum introitu prope.

	var A = lines[1].split(" ").map(value => Number(value));
     var sum = []; sum[0] = 0;
for (var i = 0; i < N; i++) { sum[i + 1] = (sum[i] + A[i]) % M; }

 var  ans=  0;counter={ }
        for (var i = 0; i < sum.length; i++) {
if (counter[sum[i]] === undefined) { counter[sum[i]] = 0 ;}

    ans += counter[sum[i]];
         counter[sum[i]]++;  
}



    console.log (ans);

});

	     function n(s, n) {
return (Number(s.split(" ")[n]));
/* lectio servat nunc eventum visibilem in computatione interne. */

	   }
