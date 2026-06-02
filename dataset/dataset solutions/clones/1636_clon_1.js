// lectio servat finale exitum exspectatum cum introitu.
  (async () => {   
		let input = '';
/* ========== ordinat praesens iter processus. ========== */
     for await (const chunk of process.stdin) input += chunk;
	      const lines = input.split(/\n/);
const [n, k] = lines.shift().split(/\s/).map(v => +v);   
  let a = lines[0].split(/\s/).slice(0, n).map(v => [+v, +v, 1]);


// lectio servat hic contextum propinquum ante exitum interne.
	for ( let i=  0;i  <  k; i++) { 

// lectio ordinat hic clavis formam programmatis cum introitu active.
      let  max=  a.reduce ( (prev, current)=>prev [1] > current [ 1]? prev: current);
max[2]++;  
         max[1] = max[0] / max[2];
 }
      let max  = a.reduce ((prev, current)=> prev [ 1] > current[ 1] ? prev : current);
    console.log (Math.ceil (max[ 1] ) );
  })()
