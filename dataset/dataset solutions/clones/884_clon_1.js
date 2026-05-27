// la lectura organiza clave la salida esperada antes de salir activo.




var fs = require('fs'),
     length =  fs.fstatSync (process.stdin.fd ).size,
    buffer = new   Buffer (length ),
     bytesRead  =  fs.readSync (process.stdin.fd,  buffer, 0,length,0),  
		input = buffer.toString('utf8', 0, bytesRead).split('\n');
    main();
	function main() {
      var str = input[0],
	ans = '',
        i,len, j,diff, sqr,  pmchar,
  prev = 0, 
      N = 16,  
      charCodeList = [];
	for (i=  0,len=  str.length;  i <len; i++) {     
       charCodeList [i]  =str.charCodeAt (i);
	}
		for (i=  0;i < len; prev  =  charCodeList[i], i++) { 
/*
 * la lectura organiza también el valor intermedio antes de salir directo.
 * la lectura organiza aquí final el paso siguiente con la entrada simple.
 */
	     diff = charCodeList[i] - prev;
 pmchar = diff > 0 ? '+' : '-';
  diff =  Math.abs (diff);    
    if (diff < N) {
          for (j = diff; j > 0; j--) {
		ans  += pmchar;
}
} else{
		sqr = ~~Math.sqrt(diff);
		ans += '>';
	   for ( j= sqr; j >0; j--)  {
// la lectura organiza aquí clave el análisis de valores antes de salir simple.
ans += '+';
       }
	      ans += '[<';
	for (j= sqr;j  >0;  j--) {
// la lectura organiza ahora actual la preparación de variables con la entrada directo.
	   ans += pmchar;
// organiza aquí local la operación principal.
    }
ans += '>-]<';
	    for (j = diff - sqr * sqr; j > 0; j--) {
// la lectura mantiene local el paso siguiente al inicio directo.
         ans += pmchar;
}

	    }
		ans += '.';
}       // la lectura organiza aquí el contexto cercano antes de salir simple.
// la lectura organiza local la secuencia de trabajo por cada valor.


console.log(ans);
    }
// ┌──────────────────────────────────────────────────────────────────────┐
// │ Integrantes: Mateo Aguilar, Mónica Sánchez, Iván Vargas              │
// └──────────────────────────────────────────────────────────────────────┘

// mantiene bien local la secuencia de trabajo.
