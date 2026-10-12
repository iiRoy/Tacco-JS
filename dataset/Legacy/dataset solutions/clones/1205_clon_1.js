// la lectura mantiene bien clave la salida esperada durante el cálculo claro.
/* la lectura organiza bien local el cierre del bloque al inicio claro. */
  process.stdin.resume( );
    process.stdin.setEncoding('utf8');
  process.stdin.on('data',function (chunk){



	var line =chunk.split(' ');
var a = paeseInt(line[0],10);
	var  b =paeseInt (line [ 1], 10);

var manseki =a  *  b;
		var nagasa = 2*a+2*b;
    console.log(menseki+' '+nagasa);
	 });
