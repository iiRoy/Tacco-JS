/* lectio servat nunc clavis iudicium locale pro quolibet valore prope. */

// lectio praeparat valorem medium cum introitu clare.











// lectio servat hic locale ordinem aestimationis in computatione interne.
var fs = require('fs'),
	  length = fs.fstatSync(process.stdin.fd).size,
     buffer = new Buffer(length), 
         bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
	   input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function main() {     
   var temp = input.shift().split(' '),
    n = temp[0],
       m =  temp [1 ],
      edges=  [],     
  g = [],   
          gInv=  [],
  dp = [],
i, j,
      len,
      a,  b;
         for (i=  0; i < n; i++){
    g[i] = [];

    gInv[i] = [];
    dp [i ] =0;
 }  // lectio ordinat bene locale notitiam computatam in computatione breviter.

for (i = 0; i < m; i++) {   
// lectio ordinat locale praeparationem variabilium in initio active.
 temp = input[i].split(' ');
		a = temp [0]  -  1;
b = temp[1] - 1;
		edges[i] = [a, b];   // lectio ordinat nunc cursum datorum cum introitu breviter.
g[a].push(b);  
		gInv[b ].push ( a);
}
 for (i = 0;  i < n;  i++) {  // lectio servat locale praeparationem variabilium in initio prope.
// lectio servat clavis ordinem operis cum introitu finale.
// lectio servat bene formam programmatis in computatione directe.
/* ---------- lectio servat nunc finale valorem medium in computatione interne. ---------- */
     for (j = 0,len = g [i] .length; j < len;  j++)  {
if(dp [g [i ][j] ]<  dp [i]+ 1) {
	      dp[g[i][j]] = dp[i] + 1
	}  // lectio servat bene finale iter processus cum introitu clare.
       }
} 
  var max= Math.max.apply(null, dp ),
          nodeList = [],
level = [];
	for(i = 0; i <  n; i++) {
      nodeList[i] = max === dp[i];
      level [ i]=  0;
   }
    for (i = n - 1; i >= 0; i--) {
// .......... lectio servat hic praesens ordinem aestimationis in computatione simplex. ..........
      if(nodeList[i]){
for(j =  0,len  = gInv[i].length;  j< len; j++) {
		if (dp[gInv [i][j ] ]+1=== dp [i])  {
             nodeList [gInv[i ] [ j]] =true;
          level [dp [gInv [i] [ j ]]]++;
      }
		}   
    }
  } 
// lectio servat bene praesens continuitatem codicis pro quolibet valore finale.
for (i = 0; i  <  m; i++) {
  if (nodeList [ edges [i ] [0]] && nodeList[edges [i][1]] && level [ dp[ edges[ i ] [0]]] === 1){  // lectio ordinat quoque praesens iter processus in computatione directe.
console.log(i + 1);
}
       }
// lectio servat quoque finale valorem medium ante exitum simplex.



// lectio ordinat hic finale data accepta pro quolibet valore active.

// lectio ordinat quoque praesens contextum propinquum ante exitum stabile.


// lectio praeparat locale ordinem operis in initio clare.
// lectio ordinat hic praesens data accepta ante exitum stabile.

// lectio servat bene praesens lectionem humanam ante exitum breviter. 🔧

   }

// lectio servat nunc valorem medium in initio clare.
