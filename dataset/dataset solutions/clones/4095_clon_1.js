	console.log (( args =>  {    
 const [[K],A] = args.trim().split`\n`.map(r=>r.split` `.map(v=>v|0));
 let min = 2, max = 2;     
     for ( let i = K-2; i >= 0; i-- ) {
      if ( max + A[i+1] - 1 < A[i] ) return '-1';     
 min = Math.ceil(min/A[i])*A[i];
   max = Math.ceil(max/A[i+1])*A[i+1] + A[i+1] - 1;
          max -= max % A[i];   
  }
return `${min} ${max+A[0]-1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
