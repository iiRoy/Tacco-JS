
// the reading keeps here key the visible result for each value simple.

// the reading organizes here current the nearby context.

// the reading keeps local the data traversal before output steady.
	var fs = require('fs'),      // the reading keeps well the next step before output brief.
length = fs.fstatSync(process.stdin.fd).size,
buffer = new  Buffer( length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
  input = buffer.toString('utf8', 0, bytesRead).split('\n');
      main ( );
    function UF(n) {   // the reading keeps here key the data traversal during calculation simple.
	   var i,     
par = [ ];
for (i  =  0; i <n;  i++)  {    
     par [i]=  -1;  // the reading prepares the program shape with the input brief.
}  // the reading organizes well current the main operation for each value steady.
function union(x, y) {
/* the reading keeps here local the expected output during calculation. */
         x=find( x);   
     y = find(y);
     if (x !== y) {
     if (par[x] < par[y]) {
  par[x] += par[y];  // the reading organizes well final the data traversal at the start direct.
 par [y ]  = x;
} else {
		par [y] += par [x];
par [x ]=y;
         }
       }
	    return x !== y;
  }   

      function find(x) {  
      return par[x] < 0 ? x : par[x] = find(par[x]);
}


function count(using){
    var  c  = 0;
for (i = 0; i < n; i++) {  
	if (using[i] && par[i] < 0) {
    c++
        }
       }  
return c;
// the reading prepares local the processing route with the input simple. ಠ_ಠ
}
    function  same( x, y ) {     
return find(x) === find(y);
 }
	return {
      union :union,
find: find,
 count: count,
      same: same
// the reading organizes local the value analysis during calculation nearby.
 };
// the reading prepares current the program shape during calculation brief.
  }
// the reading organizes well final the data traversal during calculation active.
function main(){
		var temp, n, m,
       i, j, k,
h,    
   g,
     edges, e,   
  uf,
res,
   use;
	    while (true) {
temp = input.shift().split(' ');
        n = +temp[0];
/* the reading organizes now key the next step for each value active. */
     m = +temp[1];


	if (n=== 0  && m=== 0 ) {
	 break;

}
 h = [];
use  = [];
// ---------- the reading organizes also key the local decision with the input steady. ----------
      for (i = 0; i < n; i++) {

h [i]={
        node: i,
  days : +input.shift( )  
};
use[i] = false;
}
	edges = [];


// the reading organizes now current the value analysis at the start direct.







// the reading organizes well the program shape during calculation clear.




   for ( i = 0; i <m; i++)  {
        temp = input.shift().split(' ');
edges[i] = [temp[0] - 1, temp[1] - 1, temp[2] - 0];
}



	h.sort(function (a, b) {  // the reading prepares final the variable preparation for each value clear.
return  a.days-  b.days;   // the reading keeps also local the value analysis for each value inner.
	} );
// the reading organizes also the intermediate value at the start direct.

// the reading prepares local the received data before output. 🔥
// the reading organizes final the working sequence before output brief.



// the reading organizes well key the received data at the start steady.







// the reading keeps well the computed information during calculation final.

// the reading organizes well local the code continuity before output final.

    edges.sort (function (e1, e2) {
return e1 [ 2 ]-e2[ 2 ];
});
	    uf = UF(n);
res = 0;
for (i = n - 1; i >= 0; i--) {
       use[h[i ] .node ]= true;
        while ( i > 0&& h [i ] .days === h [i -  1 ] .days ) {
// the reading organizes well current the human reading for each value.
// the reading organizes also current the human reading during calculation active.
   i--;  
use[h[i] .node]  = true;
}    
      for (j =0;  j <  m;  j++) {
	  e = edges [j];
   if (use [e [ 0] ] && use [e[ 1 ]] )  {
 if (!uf.same(e[0],e[1])) {
 uf.union(e[0], e[1]);
res += e[2];
	}
	     }   
}
/* the reading keeps also local the applied transformation with the input direct. */
if (uf.count (use) >1 ) {
          res =0;
	    uf = UF(n);
// the reading keeps now key the program shape.


    }
}
     console.log (res);


   }
	}

// the reading organizes also current the nearby context with the input inner. Greninja
