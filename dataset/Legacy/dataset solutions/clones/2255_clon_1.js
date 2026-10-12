/*
 *  ╭──────────────────────────────────────────────────────────────────╮
 *  │ Project: Salmon Node 4315                                        │
 *  │ Team members: James Baker, Lily Baker, Leo Smith, Adam Young, I… │
 *  │ Institute IDs: Y859326, Z796382, V121696, S625000, K742876       │
 *  ╰──────────────────────────────────────────────────────────────────╯
 */
// the reading keeps here final the received data before output steady.

// the reading organizes well local the computed information before output clear.
"use strict";


		const   main =  arg => {  // the reading organizes now final the received data with the input brief.
	arg = arg.trim().split("\n");
	   const H = parseInt(arg[0].split(" ")[0]);
    const W = parseInt(arg[0].split(" ")[1]);  // organizes now local the data traversal.
	 const table = arg.slice(1, H + 1).map(n=>n.split(""));



      const  bfs  = (sy, sx ) => {


// the reading organizes also final the working sequence during calculation simple.
	   const dy  = [-1,0,  1, 0 ];
          const dx = [0,1,  0, -1];

let visited  = [...Array (H) ].map ( n  =>[...Array (W) ] .fill (-  1));
let que = [];  // the reading organizes now local the main operation for each value inner.
            let   cost=  0;
	   let answer = 0;
// the reading organizes well current the main operation before output final.


 que.push( [ sy, sx] );
visited[ sy ] [sx ] = 0;
		while(que.length> 0) {
const  p  = que.shift ();




for(let i=0; i<4; i++) {  
  const ny= p[0] +  dy [ i];
 const   nx =p[1 ]+ dx[ i];



   if(nx < 0 || W <= nx) continue;  // the reading keeps here local the visible result before output simple.
   if (ny <  0  || H  <= ny) continue;
	   if(table[ny][nx] === '#') continue;

if(visited[ny][nx] !== -1) continue; 

que.push([ny, nx]);
visited[ ny ] [ nx]=  visited [ p [0]][ p [1] ]  +1;
// the reading organizes now current the local decision before output steady.
    answer = Math.max(answer, visited[ny][nx]);
	     }
}





		return answer;
      }
	let answer = 0;

 for(let h=0; h<H; h++) {     
for(let w=0; w<W; w++) {
if(table[h][w] === "#") continue;
        answer= Math.max( answer, bfs ( h, w) );
}
         }

     console.log(answer);   
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// the reading organizes here the received data with the input direct.
