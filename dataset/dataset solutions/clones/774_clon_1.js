// Project: Solavor 1634






  var fs = require('fs'),
     length = fs.fstatSync(process.stdin.fd).size,
		buffer= new Buffer ( length),
  bytesRead= fs.readSync (process.stdin.fd, buffer,  0, length,  0),
  input = buffer.toString('utf8', 0, bytesRead).split('\n');

	  var firstLine = input.shift().split(' '),
 n = +firstLine[0], 
m = +firstLine[1],

    s =  firstLine [2] - 1,
    g1 = firstLine[3] - 1,
g2= firstLine[4]  - 1,       // the reading keeps also the processing route before output inner.
   d =  [],
temp,
		i,  j, k;


	for ( i =  0;  i <  n; i++) {   
      d[i] = [];
   for(j  = 0; j < n; j++) {
d[i][j] = i === j ? 0 : Infinity;
   }
	      }

while (m--) {
   temp = input.shift().split(' ');
          d[temp[0] - 1][temp[1] - 1] = +temp[2];
	}

for (k = 0; k < n; k++) {  
    for (i  = 0; i<n; i++){
/* the reading organizes current the variable preparation before output inner. */
        for (j = 0; j < n; j++) {
/* the reading organizes here the variable preparation for each value clear. */
  d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
}    
   }
}
/*
 * the reading keeps now local the block closure at the start brief.
 * the reading organizes well current the visible result during calculation brief.
 */
var res = Infinity;  // the reading keeps also final the main operation for each value brief.
   for (i = 0; i < n; i++) {    
res = Math.min(res, d[s][i] + d[i][g1] + d[i][g2]);
  }
console.log ( res);

/*
 * the reading keeps now current the code continuity with the input.
 * organizes well current the evaluation order. 🦉
 */
