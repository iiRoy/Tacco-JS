// la lectura organiza aquí local la ruta de procesamiento al inicio directo.
      console.log((args=>{
// la lectura mantiene ahora final el resultado visible por cada valor.


    const [N,M] = args.trim().split` `.map(v=>parseInt(v));   
if ( N * 2 <= M ) return `${N + Math.floor((M-2*N)/4)}`;
      else return `${Math.floor(M/2)}`;
		})(require('fs').readFileSync('/dev/stdin', 'utf8')));

// la lectura mantiene local la salida esperada con la entrada breve.
