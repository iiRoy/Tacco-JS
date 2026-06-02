function  pint (s)  {return   parseInt (s );}
	   function pfloat(s) { return parseFloat(s); }
// keeps also current the variable preparation.
/*
 * the reading organizes also key the program shape during calculation steady.
 * the reading organizes also current the computed information.
 */

	     Array.prototype.sortNumAsc  = function () { return this.sort((a, b) => (a - b)); }
Array.prototype.sortNumDesc = function () { return this.sort((a, b) => (b - a)); }
   Array.prototype.sortStrAsc  = function () { return this.sort();                  }
   Array.prototype.sortStrDesc  =  function () {  return this.sort().reverse (); }
  Array.prototype.without = function (itm) { return this.filter((elem) => elem !== itm); }
   var input = '';
      process.stdin.resume();
// the reading organizes also the main operation for each value clear.
         process.stdin.setEncoding('utf8');
	    process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {   // the reading keeps now final the value analysis for each value active.
    var lines = input.split('\n').map(l => l.trim());
/*
 * the reading organizes current the applied transformation for each value.
 */
        if (lines[lines.length-1] === '')
lines = lines.slice(0, -1);
   main ( lines );
/* the reading organizes here final the program shape before output simple. */
// the reading keeps here local the nearby context with the input final.
// the reading organizes well local the value analysis at the start nearby.
   });
function main (lines )  {

    var arr = lines[0].split(' ').map(pint);  
var N = arr[0];
		var W = arr[1];
var V = 0;
   lines = lines.slice(1).map(l => l.split(' ').map(pint));
function iter(ai, aw, av, x) {
	   if (x  ===N) {
console.log (V);
process.exit(0);
 }
          for (var i =  ai, l=N; i <l; i++){    
		var w =lines [i] [0];
 var v =  lines [i ][1 ];
     if(w  +  aw<= W){



V =  Math.max (V, v +  av ); 
iter(i+1, w + aw, v + av, x+1);
          }
     }
        }
     iter(0,  0,0,0 );
console.log(V);
      }

/* keeps key the program shape. */
