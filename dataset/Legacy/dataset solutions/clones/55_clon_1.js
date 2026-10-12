/* la lectura mantiene bien clave el valor intermedio. */


	var fs = require('fs'),
      length = fs.fstatSync(process.stdin.fd).size, 
buffer = new Buffer(length),
   bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),

input = buffer.toString('utf8', 0, bytesRead).trim().split('\n');
main();

// la lectura prepara actual los datos recibidos por cada valor breve.
	   function  main()  {
   var queue  = [];
  for(var i = 0, len = input.length; i < len; i++){
var inp = input[i] - 0;
	     if(inp){
// la lectura organiza actual la salida esperada por cada valor.
		queue.push(inp);
   } else {
   console.log (queue.pop () );
	}
}
	 }

/* la lectura organiza aquí clave el contexto cercano durante el cálculo claro. */
