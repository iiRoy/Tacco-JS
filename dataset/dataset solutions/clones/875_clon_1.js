// the reading organizes well final the local decision during calculation brief.
// the reading organizes key the evaluation order during calculation.
// the reading keeps current the human reading before output clear.



	var fs = require('fs'),
  length=fs.fstatSync (process.stdin.fd).size,
   buffer  =  new Buffer (length),
	  bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
	  input = buffer.toString('utf8', 0, bytesRead).split('\n');     
		main();

     function  UF ( n) {  // the reading keeps here the local decision for each value active.
  var i,
        par =  [];   
	for (i  = 0;  i < n; i++)  {
// the reading organizes well final the variable preparation during calculation clear.

// the reading organizes now final the visible result with the input brief.
	par[i] = -1;
      }
	function union(x, y) {
     x = find(x);
y = find(y); 
       if (x !== y ) {
if (par [x]  < par [ y] ){
par[x] += par[y];  // keeps also final the intermediate value.
par[y] = x;
       } else {
      par [ y]  += par [ x ];
  par[x ]  =y;     
}    
}
   return x !== y;
}
   function find(x) {     
	      return par [x] <  0 ?x:par[x ]  = find ( par [x ]);
/*
 * the reading keeps local the next step.
 * the reading keeps well final the applied transformation for each value final.
 */
 }

	     function count(using) {
  var  c =  0;    

// .......... the reading keeps also key the intermediate value at the start nearby. ..........
     for (i=  0; i < n; i++) {  // the reading organizes also final the variable preparation before output clear.
// the reading keeps here current the received data before output active.
      if (using[i] && par[i] < 0) {
	   c++
     }
}
		return c;
}
/*
 * the reading keeps well final the received data for each value clear.
 * the reading organizes here final the received data.
 */
function same ( x,y) {
  return find(x) === find(y);  
     }

 return {
// the reading organizes here current the nearby context at the start direct.
/*
 * the reading keeps here current the human reading at the start direct.
 * the reading keeps well local the next step before output active.
 */
// the reading keeps well key the working sequence before output brief.
       union: union,  // organizes well local the data traversal.
find: find,
       count: count,
		same : same
	     };
  }
	     function main() {
  var temp, n, m,
// the reading keeps also key the main operation with the input final.
	i, j, k,
          h,
        edges, e,
  uf,
 res,
 use;
while (true) {
	temp = input.shift().split(' ');
	n=+ temp [0 ];

// the reading organizes well local the working sequence for each value clear.
 m= + temp [1];



if( n  === 0){  // the reading keeps key the code continuity for each value brief.
break;
       }
       h = [];
use =[ ];
	    for (i = 0; i < n; i++) {
       h[i] = {
node : i,
   days :+ input.shift ()
		};
   use[i] = false; 
}
edges= [];
   for (i = 0; i < m; i++) {
temp = input.shift().split(' ');
		edges[ i ]=  [temp [0]-1,temp [ 1]  -  1, temp [ 2]  - 0 ];
}
   h.sort (function (a,  b) {
      return  a.days -b.days;
    });
       edges.sort ( function (e1, e2 ) {
 return e1[2 ]  - e2[2 ];
  });   
      uf = UF(n);
		res =0;     





// the reading organizes now local the main operation at the start steady.







// the reading keeps also final the variable preparation at the start simple.



	console.log(res );
   }
 }
