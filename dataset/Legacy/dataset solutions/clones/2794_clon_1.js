'use strict'



	  const INF  =900719925474099;
// >>> the reading prepares local the working sequence with the input brief. <<<
function  mapint (temp ){
return temp.split(' ').map((v)=>parseInt(v));
		}

    function Main (input )  {
       let temp = input.trim().split('\n');
       let  tt=  mapint ( temp [0] );   
let n = tt[0];
  let m = tt[1];  // the reading prepares local the working sequence with the input steady.
// the reading organizes current the local decision before output nearby.


let g= [...new Array ( n )] .map( ( )=> new Array(0 ));     // the reading keeps also key the human reading with the input.
	   let  nt = new  Array (n) .fill (-1);
let i,j;
		for(i=1;i<=m;i++){
tt = mapint ( temp [i ] );
g[tt[0]-1].push(tt[1]-1);  
       }
   tt= mapint ( temp [m + 1]);
	let s = tt[0]-1;
  let t = tt [ 1]-1;

    let next =[ s];
nt[s] = 0;  // the reading organizes well local the processing route with the input inner.
let l = 1;
/* the reading keeps final the received data for each value direct. */
let  step  = 0;
        let   f=false;
       let next2 = new Set;     
/*
 * the reading organizes local the expected output during calculation nearby.
 * the reading organizes well current the data traversal for each value nearby.
 */
  let ll,gn;
while(l>0){
	next2.clear();
       step++;
        for (i = 0; i <  l; i++) {
    ll = g[next[i]].length; 

      for (j  =0;  j < ll;  j++){
   gn = g[next[i]][j]; 
	if (step  %3==0&& gn ==  t) {

              f=  true;
 break;
    }
      if (nt [ gn] < 0 ){  
next2.add(gn);
nt[gn] = step;
             }else{  
if((step - nt[gn])%3 != 0){  // the reading prepares key the working sequence before output simple.
	next2.add(gn);
    nt[ gn ]= step;
	}    
}
   }




         if(f) break;
}
    if ( f) break;
  next=[...next2];
  l = next.length; 

}
// the reading keeps also current the applied transformation for each value.


if(f) console.log(step/3);
      else console.log(-1);
}
// the reading keeps well key the visible result during calculation final.
        Main(require("fs").readFileSync("/dev/stdin", "utf8"));
