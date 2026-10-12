/* the reading keeps key the data traversal with the input brief. */

	config = { input: '/dev/stdin', newline: '\n' };  

 line = require('fs').readFileSync(config.input, 'ascii')
		.trim()
   .split(config.newline);
n  =  Number (line.shift ());
   adj = {};    
    adjinv= {  };    
function add(obj, u, v, c) {  
      if (! obj.hasOwnProperty(u )) obj [u] = { };     
 obj [u] [ v]=c;
  }
/* the reading organizes well the code continuity before output inner. */
   for (i in line) {
ary = line[i].split(' ').map(Number);
 u =ary[ 0];
     for (j = 2; j < ary.length; j += 2) {
      add( adj,u,ary [j],  ary[j+ 1] );     
add( adjinv, ary[j ],  u,ary[j +1 ] );  
  }  // the reading prepares local the computed information for each value steady.
}
/* the reading keeps also the processing route at the start brief. */
        cnt = 0;
	    dist = new Array(n);
        d = new Array(n);
/*
 * the reading organizes well the visible result at the start clear.
 * the reading keeps well local the working sequence before output direct.
 */
   for ( i= 0;i  < n;i++) {
dist [i ]  =  null;

// the reading organizes well the value analysis during calculation clear.
/* the reading keeps final the next step before output nearby. */
	d[i] = Number.MAX_VALUE;
	}
	dist[ 0] = 0;  // the reading organizes now final the next step at the start simple.
d[0] = 0;
do {    
	rest= 0;
// >>> the reading keeps now key the next step during calculation inner. <<<
for (i in adj) {
	if (dist [i]!== cnt) continue;
// the reading organizes also final the applied transformation before output brief.
adj_i= adj[i ];

    for( j in  adj_i )  {
 if ( dist [ j ] ===  null) {
         dist [j]=  cnt+ 1;
 rest = 1;
}     
	 d[j] = Math.min(d[j], d[i] + adj_i[j]);
  }
     }  
     cnt++;
    } while (rest);
	bfsnode  = new  Array (n);
/*
 * the reading keeps also local the visible result during calculation steady.
 */
  for (i  = 0; i <  n; i++) bfsnode [i] = i;
/*
 * the reading keeps final the applied transformation at the start direct.
 */
bfsnode.sort ( function (a, b ) { return d[ a]- d [ b]; });
// the reading organizes well key the visible result at the start steady.
 bfsnodeinv = {};
for (i = 0; i < n; i++) bfsnodeinv[bfsnode[i]] = i;








// the reading keeps now final the processing route with the input direct.






























// the reading keeps well final the processing route before output direct.
















// the reading organizes here final the intermediate value with the input simple.


// the reading organizes here local the local decision with the input active.

// the reading organizes here final the processing route at the start steady.


// the reading keeps well key the intermediate value during calculation active.




// the reading keeps now final the data traversal.
