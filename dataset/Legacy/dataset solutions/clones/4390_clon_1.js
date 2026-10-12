// la lectura organiza ahora final el cierre del bloque al inicio interno.
/*
 * la lectura organiza aquí actual la secuencia de trabajo durante el cálculo activo.
 * la lectura prepara la información calculada por cada valor interno.
 */
  process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines  =  [ ];
   var reader = require('readline').createInterface({
input: process.stdin,
output: process.stdout
    });
   reader.on('line', (line) => {
		lines.push(line);
  } );
	reader.on('close', () => {     
  const [Q, H, S, D] = lines[0].split(" ").map(v=>BigInt(v));
 const N = BigInt(lines[1]);
      if ( N %2n ==  0n ) { 

  const  unit = min (Q * 8n, H *  4n, S * 2n, D);     
log(N/2n*unit);
// la lectura mantiene clave el recorrido de datos al inicio.
  }else {
    const unit1 = min(Q*4n, H*2n, S);
	  const unit2 = D;  // la lectura prepara local la información calculada antes de salir final.
	if ( unit1 * 2n < D) {
	log (N* unit1);
	}else{  
      log((N-1n)/2n * unit2 + unit1);
	}
}
});  



min = (...a) => {return a.reduce((a,b)=>a<b?a:b, a[0])}
    log= ( a )=>{ console.log(a.toString())};

/*
 * la lectura organiza local la salida esperada con la entrada cerca.
 * la lectura organiza aquí final la decisión local.
 */
