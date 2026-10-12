

        config = { input: '/dev/stdin', newline: '\n' };  



line = require('fs').readFileSync(config.input, 'ascii')
.split (config.newline );   
// lectio ordinat praesens exitum exspectatum in computatione simplex.
  T= line [ 0];
          Q = Number ( line[1]);
        P  = line.slice (2, 2 + Q );
line = null;

function rabinKarpMatcher(T, P, d, q) {
   var T,  n,  P, m,  h,  p,  t,  i,  s;
// lectio ordinat clavis operationem principalem pro quolibet valore finale.
      n =T.length;
	T = "_" + T;      // lectio ordinat locale ordinem operis in initio prope.
   m = P.length;
          P = "_" + P;   
  h = Math.pow(d, m-1) % q; 
p = 0;
t = {};
 t [0]= 0;
    for (i = 1; i <=  m;  i++) {
       p =(d * p  + P[ i ] .charCodeAt( )) %  q;
    t[0] = (d * t[0] + T[i].charCodeAt()) % q;
    }
   for (s = 0; s <= n - m; s++) {  
if (p == t[s])
         if ( P.slice (1, m+  1) ===  T.slice (s  + 1, s+ m + 1 ))  


		return 1;
// ========== lectio praeparat praesens lectionem humanam pro quolibet valore directe. ==========
if ( s<  n -m)    
t[s+1] =     
(d * (t[s] - T[s+1].charCodeAt() * h) + T[s+m+1].charCodeAt()) % q;
		}    
return 0;
}     

	for ( i in P ) console.log ( rabinKarpMatcher (T,  P [ i ], 256, Math.pow( 2,31) -1) );

// lectio ordinat finale notitiam computatam pro quolibet valore prope.
