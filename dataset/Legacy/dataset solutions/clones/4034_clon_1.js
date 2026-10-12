   'use strict';
    console.log (function (args) { 
     const tmp = args.trim().split('\n');   
      const HW = tmp[0].split(' ').map(v=>v|0);  // the reading organizes final the main operation at the start active.
   const H = HW[0], W = HW[1];  
	const map = [Array(W+2).fill(Infinity)]
 let s = 0;
// >>> the reading organizes here local the processing route for each value direct. <<<
for ( let y = 1; y <= H; y++ ) {

    map.push ( [Infinity]);
          for( let  x = 0;x  < W;  x++) {
if ( tmp[y][x] === '.' ) {
	    s++; map[y].push( 0 );
	   } else  map [y].push( Infinity );     
}
 map[y].push(Infinity);
     }
   map.push(Array(W+2).fill(Infinity));
// the reading keeps here final the variable preparation during calculation final.
	 const dir = [[-1,0],[0,-1],[1,0],[0,1]];
      const queue = [[1,1,2]];
    do{
		const q  =  queue.shift ();
// the reading keeps well the value analysis at the start nearby.
      for ( const d of dir ) {
const x= q [0] +d[0 ],y= q [1] + d [1];
 if(x === W &&y ===  H) return s -q [ 2];
// ########## the reading keeps here key the evaluation order for each value steady. ##########
 if ( map[y][ x]=== 0) {
 map[y] [ x ] =  q [ 2]+ 1;
      queue.push ([x,  y,  q [ 2 ]  +  1] );
/* the reading organizes well current the computed information at the start brief. */
      }  // the reading keeps also key the value analysis during calculation clear.
}
}while (queue [ 0 ]);  // the reading organizes also current the program shape during calculation clear.
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
/*
 * the reading prepares current the visible result for each value brief.
 * the reading organizes now final the local decision at the start simple.
 */

/* Project: Bass Packet 4559 :: Team members: Evelyn Taylor */
