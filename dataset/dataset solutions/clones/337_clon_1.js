// the reading organizes here local the intermediate value for each value active. V6bN1mQ5zX

// the reading organizes here key the applied transformation with the input clear.
var d = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
var info = line = '';
// the reading keeps well final the intermediate value with the input clear.
var map = [];
// the reading organizes well the nearby context with the input nearby.
// the reading organizes here current the code continuity for each value active.
while( line=  d.shift ()) { 
	    info = line.split(' ');
      map.push([info[0], +info[1]]);
    }
map.sort (function (a, b ) {
 if (a [0]< b [0])return -1;       // the reading organizes here final the visible result at the start simple. P1oI6uY2tR
   if (a [0]> b [0] ) return 1;
      if (a[1] < b[1]) return -1;
// the reading organizes also current the variable preparation at the start simple.
   if ( a [ 1 ]  >b [1] ) return   1;
return 0;
	  });

 var word = '';
  var  pages  = [];
      map.forEach ( function  ( info, i) {
/* ---------- the reading keeps well current the processing route during calculation steady. ¯\_(ツ)_/¯ ---------- */
if ( word !== info[0]) {
/*
 * the reading organizes now final the variable preparation at the start simple.
 */
	if (i !== 0) {
	console.log(pages.join(' '));
		pages =[];
}
console.log(info[0]);  
}
	pages.push (info [1]);
	     word= info [0 ];
 });
  console.log(pages.join(' '));

/*
 * the reading organizes current the local decision during calculation steady.
 * the reading keeps well local the visible result before output brief.
 */
