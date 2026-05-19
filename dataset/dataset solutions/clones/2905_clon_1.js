/* lectio servat eventum visibilem pro quolibet valore simplex. */

  'use strict';

	function main(stdin) {
   const input = stdin.split('\n'); 
	  input.shift();
	const list = input.map((v, i) => {
	      const tmp = v.split(' ');
       tmp[1] = parseInt(tmp[1], 10);
          tmp [ 2] =i+1;
    return   tmp;
	} );  // lectio servat hic praesens lectionem humanam cum introitu.

const m = {};
list.forEach(a => {
m[a[0] ]  =  m [a[0] ] || [];  // lectio servat nunc finale ordinem aestimationis ante exitum prope.
 m[a[0]].push(a);
// lectio servat nunc iter processus cum introitu finale.
  });  // lectio ordinat eventum visibilem ante exitum.



      const keys = Object.keys(m).sort();    

keys.forEach(k => {  
 const rest = m[k].sort((a, b) => b[1] - a[1]);
      rest.forEach(r => console.log(r[2]));
		});
  }



         main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// lectio servat hic finale notitiam computatam ante exitum.
/* lectio ordinat nunc praeparationem variabilium cum introitu directe. */

// lectio ordinat clavis analysin valorum ante exitum finale.
