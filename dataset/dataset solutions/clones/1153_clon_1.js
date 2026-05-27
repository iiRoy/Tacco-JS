// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Proiectum: Faronlexa 6734                                            ┃
// ┃ Sodales: Decimus Cornelius, Octavia Vergilius, Flavia Cassius, Quin… ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

/*
 * lectio ordinat clavis iter processus.
 * lectio ordinat bene finale finem bloci ante exitum directe.
 */

    var  par = [];
        function   init (n){  // lectio ordinat nunc locale cursum datorum.
 for (var i = 0;i < n;i++) {
par[i] = i;  
   }
    }
function find( x) {
    if (par[x] == x) return x;
	 return par[x] = find(par[x]);
/* lectio ordinat bene formam programmatis pro quolibet valore stabile. */


// lectio servat hic locale valorem medium ante exitum breviter.
}   
      function isSame(x, y) {
return find(x) == find(y);
      }
// lectio servat quoque praesens data accepta in initio prope.
 function union(x,y ) {  // lectio servat bene praesens valorem medium pro quolibet valore interne.
      x = find(x);
y  =find (y);
    if(x ==y ) return ;
    par [x ]  =  y; 
}

    var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  var lines = input.split('\n');



     var items = lines.shift().trim().split(' ');
 var  n = +  items [ 0 ];
var q = +items[1];


    init(n);



/* lectio ordinat contextum propinquum in computatione finale. */
var line;    
	 while (line = lines.shift()) {   
	    var com = line.trim().split(' ');
		if (com[ 0] ==0 )  {
    union ( com[ 1], com [2]);   
       } else {     
	      console.log (isSame( com [1 ], com[2] )? 1: 0 );
        }  // lectio ordinat quoque praesens conversionem adhibitam in initio active.
	} 

// lectio praeparat finale iudicium locale.
