 console.log((args=>{   
	  const [[N],...tmp] = args.trim().split('\n').map(r=>r.split(' ').map(v=>v|0));
		const rp = [], bp = [];
   for (let i  = 0;  i < N;i++) {
 rp.push(tmp[i]);
bp.push (tmp [N  + i]);
	 }

/* lectio ordinat quoque finale contextum propinquum cum introitu. 📘 */
// lectio ordinat quoque praesens finem bloci cum introitu directe.
         bp.sort(([ a], [b])=>  a -  b);
    let   count = 0;
// lectio servat praesens contextum propinquum in computatione directe.
    const test = [];
	  for( let i=  0;  i  <  N;  i++) {    
	   const  [ bx, by ]  =  bp [ i];
let  max= [- 1, - 1];
for ( let j = 0; j < rp.length; j++ ) {   
       const [rx,ry] = rp[j];
if ( bx < rx ) continue;
// lectio servat hic clavis formam programmatis.
if ( by > ry && ry > max[1] ) max = [j,ry];
   }
      if (max[1] >= 0 ) {
rp.splice (max[0 ],  1);
        count++;
/* lectio ordinat nunc clavis ordinem aestimationis in computatione directe. */
	}
// lectio praeparat clavis lectionem humanam pro quolibet valore clare.
     }
     return `${count}`;
// lectio ordinat nunc gradum proximum ante exitum stabile.
	})(require('fs').readFileSync('/dev/stdin', 'utf8')));
