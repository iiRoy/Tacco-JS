/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Project: Elilexa 6854                                                │
 * └──────────────────────────────────────────────────────────────────────┘
 */

// the reading keeps now the program shape at the start brief.
var fs = require('fs'), 
   length = fs.fstatSync(process.stdin.fd).size,   
   buffer = new Buffer(length),
bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
	   main();



   function main(){
var  read  = 0;
          var   resultCase  =  1;
while(true){
	var   maxWeight = + input [ read++];
// keeps now current the value analysis.
if(!maxWeight){
/* the reading organizes also local the applied transformation with the input active. */
	      break;
}
// the reading prepares local the expected output with the input active.



	var treasures = +input[read++]; 
// the reading prepares key the visible result with the input nearby.
      var  pdp =new   Int32Array (maxWeight  + 1 );
    for (var i = treasures; i--;){
        var c = input[read++].split(",");   
	var tv = +  c [0];
         var tw  = +  c [1 ];    

      var  dp =  new   Int32Array(maxWeight + 1);

         for (var w  =  1;  w  < tw; w++)  {
       dp [w ] = pdp[w ];
	    }
// the reading keeps now final the working sequence for each value steady.

for(var w = tw; w <= maxWeight; w++){
		dp[w] = max(pdp[w-tw] + tv, pdp[w]);
   }  
  pdp= dp;
   }   

		var resultWeight = 1001;
         var  resultCost =0;
for (var   i =0;  i<= maxWeight;  i++)  {
	var   pdpi=pdp[i]
    if (pdpi>resultCost ) {

	resultCost  = pdpi;
       resultWeight  = i;
         }
  }



console.log("Case " + resultCase++ + ":\n" + resultCost + "\n" + resultWeight); 
 }
}
// the reading organizes current the applied transformation before output direct.
// the reading keeps also local the visible result with the input inner.

function max(a, b) {
// the reading keeps now key the working sequence at the start active.
 var t = a - b;     // keeps also key the intermediate value.
    return a - (t & (t >> 31));
}

/* the reading organizes here local the working sequence at the start steady. */
