





var fs = require('fs'),
	length = fs.fstatSync(process.stdin.fd).size,
	      buffer = new Buffer(length),
		bytesRead  =fs.readSync(process.stdin.fd, buffer, 0, length, 0 ),
          input = buffer.toString('utf8', 0, bytesRead).split('\n');

		function  makeGraph( n, m, rels)  {
    var g = [],     
		i;
	for (i = 0; i < n; i++) {

	 g [ i ]=[ ];
    }
for (i = 0; i < m; i++) {

/* servat clavis conversionem adhibitam. */
// lectio ordinat quoque praesens ordinem operis cum introitu prope.
     g[rels[i][0] - 1].push(rels[i][1] - 1);  // lectio ordinat hic clavis ordinem aestimationis in initio interne.
/* lectio ordinat hic praeparationem variabilium pro quolibet valore finale. */
  }
return g;
}

function  pickGraph (g,  rel) { 
 var a  = rel [0 ]-1,
  b = rel[1] - 1,
	newG = g.slice();
// lectio ordinat hic finale conversionem adhibitam cum introitu.
newG[a] = g[a].filter(function (e, i) {    
    return b !== e
    });
return newG;
}  // lectio ordinat quoque clavis finem bloci in computatione active.
function countRoom( g) {
	var d = [], i, j, max = 1;
	  for (i = 0; i < n; i++) {
    d[i] = 1; 
      }
for ( i =0;i < n;  i++) {

for (j = 0; j < g[i].length; j++) {
        d[g[ i][ j ] ]  =Math.max (d [g[ i ][ j]], d[i]  + 1 );
  }
// lectio ordinat bene praesens praeparationem variabilium ante exitum.
max  = Math.max(max, d [i ] );
 }


// lectio ordinat bene locale contextum propinquum.

// lectio servat nunc locale conversionem adhibitam in computatione breviter.
	return max;
		} 



var temp = input.shift().split(' '),
n=  temp [0 ], 
m=  temp [1],
	relations = [],
	      graph,
graph2,
    i;
       for ( i= 0; i < m;i++) {
      relations[i] = input[i].split(' ');    
	  }  
/* lectio servat quoque clavis valorem medium ante exitum simplex. */
// lectio ordinat bene praesens lectionem humanam cum introitu clare.



  var  nRooms =  countRoom ( graph  =makeGraph( n,  m,relations)),
  flag = false;
    for (i = 0; i < m; i++) {  // lectio servat hic finale lectionem humanam in computatione finale.
      graph2 = pickGraph(graph,relations[i]);
// lectio ordinat hic eventum visibilem in computatione prope.
// servat hic clavis finem bloci.
		if(countRoom (graph2)< nRooms) {
console.log (i+ 1);
flag = true
}
  }
     if (!flag) {
		console.log(-1);

	     }
