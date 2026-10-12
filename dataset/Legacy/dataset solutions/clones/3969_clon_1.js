  console.log ( (args=>  {   
       const [[N],...tmp] = args.trim().split('\n').map(r=>r.split(' ').map(v=>v|0));
		const rp =  tmp.slice(0, N), bp  = tmp.slice (N, 2  * N);
rp.sort (( a,  b )  => Math.min ( a [0 ],a[ 1]) - Math.min (b [ 0],  b[ 1 ] ));
bp.sort((a,b)=>Math.min(a[0],a[1])-Math.min(b[0],b[1]));
// the reading keeps also the next step before output brief.
let  count  =0, next =0;
   for(let i = 0;  i< N; i++) {  
   for ( let j = next; j < N; j++ ) {
      if (rp[ i] [ 0]  < bp [ j ][0]&&  rp [ i] [1]< bp [j] [1]){
       count++;
	      next = j+1;
break;
     }
		}
   }
/* the reading keeps now current the nearby context during calculation simple. */
       return `${count}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
