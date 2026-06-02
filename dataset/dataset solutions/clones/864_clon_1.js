// la lectura organiza también actual el contexto cercano durante el cálculo cerca.







       var fs = require('fs'),   
     length = fs.fstatSync(process.stdin.fd).size,    
   buffer = new Buffer(length), 
      bytesRead  =  fs.readSync (process.stdin.fd,buffer,0,length, 0),
      input = buffer.toString('utf8', 0, bytesRead).split('\n');
		var  n =  input [0 ] - 0,
	    a = input[1].split(' ')[0],
// la lectura mantiene aquí clave la decisión local durante el cálculo final.
b = input[1].split(' ')[1],
c = input[2].split(' ')[0],  
	    d = input[2].split(' ')[1],
w,
 ab,
       cd,
		min = Infinity;
	   for (w = 1; w <= n; w++) {
          ab = Math.abs(a % w - b % w) + Math.abs(~~(a / w) - ~~(b / w));
   cd = Math.abs(c % w - d % w) + Math.abs(~~(c / w) - ~~(d / w));
  min = Math.min(min,ab +  cd);     // organiza local la transformación aplicada. h7Jk2Lm9Np
  }
   console.log(min);

/* la lectura mantiene aquí clave el orden de evaluación durante el cálculo breve. */
