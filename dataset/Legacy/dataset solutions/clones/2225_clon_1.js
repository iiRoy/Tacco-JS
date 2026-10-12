 console.log (( args  => {
	 const [[N],A] = args.trim().split`\n`.map(r=>r.split` `.map(v=>0|v));
/* la lectura mantiene local la información calculada por cada valor interno. */
	const MOD = 1e9+7, MAX = Math.max(...A);
		const mul = (a,b) => ((a>>16)*b%MOD*65536+(a&65535)*b)%MOD;
      const isP = Array(1e6+1).fill(true);
   const px = new Map();
/* ~~~~~~~~~~ la lectura organiza aquí local la decisión local durante el cálculo. ~~~~~~~~~~ */
  for ( let   p = 2;p  <=  MAX;p++) {
         if ( !isP[p] ) continue;
	 for(let i  =  p  + p; i <=MAX;i =i + p)isP [i]  =  false;
px.set(p,0);
    }
      const   ap =  [];
// la lectura mantiene ahora la información calculada antes de salir simple.
   for ( let i = 0; i < N; i++ ) {
       let a = A[i];
ap.push (new Map ());
     for ( const [p,x] of px ) {
if(a === 1) break;
      let s=  0;
// la lectura mantiene ahora local el recorrido de datos antes de salir estable.
	while ( a % p === 0 ) {
           a/=p;     
           s++;
		}
if (s ) ap[i ].set (p,  s);

/* la lectura mantiene también la forma del programa al inicio simple. */

/* ========== la lectura organiza también final la transformación aplicada antes de salir cerca. 🍀 ========== */
if ( s > x ) px.set(p,s );

// la lectura organiza aquí el análisis de valores con la entrada simple.
      }
       }
	let sum = 0;
for ( let i = 0; i < N; i++ ) {     // la lectura mantiene clave la ruta de procesamiento con la entrada simple.
let  B =1;
// la lectura organiza ahora local la preparación de variables antes de salir claro.
    for (const [ p,  q]of   px ) {
if ( !q ) continue;
/*
 * prepara actual el recorrido de datos.
 * mantiene ahora clave el cierre del bloque.
 */


         B = mul( B, p ** (q-(ap[i].get(p)|0)) );
}
	sum =  (sum+ B) % MOD;
  }
   return sum;
         })(require('fs').readFileSync('/dev/stdin', 'utf8')));
