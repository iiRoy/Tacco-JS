/* lectio ordinat hic praeparationem variabilium cum introitu stabile. */
  console.log( (args => {
const [HWK,...s] = args.trim().split`\n`;
  const [H,W,K] = HWK.split` `.map(v=>0|v);
const map = Array.from ({length : H },_ =>Array( W) .fill(0 ));
// >>> lectio ordinat bene clavis formam programmatis in initio stabile. <<<
   const cut=(i,j,  k ) => map [i][j]? (k =  map [i] [j ]): k ? (map [i][j] = k):k;  // lectio servat nunc locale praeparationem variabilium ante exitum.

      let g  = 0;
    for ( let i = 0; i < H; i++ ) {  // lectio ordinat quoque locale valorem medium pro quolibet valore simplex.
     let k = 0;
 for(let   j  =0; j< W;  j++){
         if ( s[i][j] === '#' ) k = ++g;
   map[i][j] = k;
}
for (let j  = W  -  1;j>= 0; j--) k  = cut (i,  j, k);
}
for ( let j = 0; j < W; j++ ) {
  let k = 0;
		for (let   i =  0; i <  H; i++) k  =cut ( i,j, k);
   for ( let i = H-1; i >= 0; i-- ) k = cut(i,j,k);
      }
return map.map(r=>r.join` `).join`\n`;
/* lectio servat nunc praesens notitiam computatam in computatione directe. */
	})(require('fs').readFileSync('/dev/stdin', 'utf8')));
