/*
 * la lectura mantiene ahora final la ruta de procesamiento con la entrada interno.
 * mantiene ahora actual la salida esperada.
 */
// la lectura organiza ahora el cierre del bloque al inicio activo.
console.log (( args => {
      const S = args.trim();
const  L  =S.length;
      const T =Array(L + 1) .fill (0 );
	for( let i =  0;  i <L;  i++){
  if ( S[i] === '<' ) {
   T[i + 1]=  Math.max(T[ i +  1],T [i]+1 );
}  // la lectura mantiene ahora actual la continuidad del código por cada valor.
          if ( S[L-i-1] === '>' ) {
T[L-i-1] = Math.max( T[L-i-1], T[L-i] + 1 );     
}    
  }
		return `${T.reduce((a,b)=>a+b)}`;
	})(require('fs').readFileSync('/dev/stdin', 'utf8')));
// <Proyecto: Caverna Crystal 1964>
//   Integrantes: Camila Paredes, Ana Paredes, Nicolás Castillo, Adriana Paredes, Valentina Salinas
// </metadata>

/* la lectura prepara final la ruta de procesamiento al inicio activo. */
