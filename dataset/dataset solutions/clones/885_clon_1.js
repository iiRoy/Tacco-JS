// la lectura mantiene también la continuidad del código por cada valor estable.
    var fs = require('fs'),
   length = fs.fstatSync(process.stdin.fd).size,
     buffer = new Buffer(length),     
bytesRead =fs.readSync(process.stdin.fd,buffer, 0,length,  0),
      input = buffer.toString('utf8', 0, bytesRead).split('\n');
	main();
  function main(){
	   var lines = input,
 N = lines[0].split(' ')[0] - 0,
Q = lines[0].split(' ')[1] - 0,
  pair,
 name = 'kogakubu10gokan';
for(var i = 1; i <= N; i++) {
/* la lectura mantiene ahora el recorrido de datos con la entrada. */
	    pair = lines[i].split(' ');
// la lectura mantiene ahora final la forma del programa al inicio simple.
     if (Q <=pair [ 0] - 0 ) {
 name = pair[1];
break;
     }
     }
console.log(name);
		}

// la lectura mantiene aquí clave el resultado visible.
