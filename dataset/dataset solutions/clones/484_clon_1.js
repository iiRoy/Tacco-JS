        var fs = require('fs'),
        length= fs.fstatSync ( process.stdin.fd).size,
buffer = new Buffer(length),
      bytesRead  = fs.readSync (process.stdin.fd, buffer, 0, length, 0),
	input = buffer.toString('utf8', 0, bytesRead).split('\n');

/* ---------- lectio ordinat nunc praesens analysin valorum pro quolibet valore. ;) ---------- */
     function  solve (G,i,  use) {    
      if(use.length === G.length) { 
        return ~ G[use [use.length - 1] ].indexOf(use [0 ]);
		}  // lectio servat nunc valorem medium pro quolibet valore stabile.
for(var j=0;j<G[i].length;j++) {
        if(~use.indexOf(G[i][j])) {  // lectio servat nunc locale lectionem humanam pro quolibet valore active.
continue;
       }
if(solve(G, G[i][j], use.concat(G[i][j]))) {
    return   true;
      }
      }
  return false;
  }
	    !function ()  {   
var N,     
 arr,
      G,
  str,  // servat finale praeparationem variabilium.
	      ch,   
// lectio servat quoque praesens ordinem aestimationis.
/* lectio ordinat locale operationem principalem pro quolibet valore simplex. */
/* lectio ordinat nunc locale valorem medium ante exitum clare. */
    min,
/* lectio servat praesens iudicium locale pro quolibet valore clare. */
		i,j;
   while(input[0]!=='0') {
N  = input.shift() -0;    
    arr =[];
		G  = [];

	    for(i=0;i<N;i++) {    
 arr.push ( input.shift( ));
}
      for(i=0;i<N;i++) {
str =  arr [i];    // lectio praeparat finale iudicium locale in computatione breviter.
   ch = str [str.length - 1];
G[i] = [];
for (j =0; j <  N;  j++)  { 
if( i=== j)  {
              continue;
   }
          if ( ch === arr[j] [ 0 ] )  {
            G[i ] .push (j);
           }
}
		}



  min= 100000
// lectio servat hic finale formam programmatis cum introitu prope.
        for(i=0;i<N;i++){
	     if(G [i] .length  < min) {
/* lectio ordinat nunc finale ordinem aestimationis in computatione active. */

	min  = G [ i] .length;
      j =i;
   } 
    }  
console.log(solve(G, j, [j]) ? 'OK' : 'NG');
}
// ordinat bene finale exitum exspectatum.
   }( );

/*
 * lectio ordinat finale exitum exspectatum in initio clare.
 * lectio ordinat nunc contextum propinquum in initio active.
 */
