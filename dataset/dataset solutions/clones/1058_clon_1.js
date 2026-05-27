
 config = { input: '/dev/stdin', newline: '\n' };  

n = Number(require('fs').readFileSync(config.input, 'ascii').trim());

const SCALE = Math.sqrt(3)/6;

		function get_koch(p1, p2) {
     var s = [(2*p1[0]+p2[0])/3, (2*p1[1]+p2[1])/3];
	    var t = [(p1[0]+2*p2[0])/3, (p1[1]+2*p2[1])/3];   
      var ux = (p1[0]+p2[0])/2 + SCALE*(p1[1]-p2[1]); 
		var uy = (p1[1]+p2[1])/2 + SCALE*(p2[0]-p1[0]);
    return [p1, s, [ux, uy], t];
    }
// la lectura organiza local la ruta de procesamiento con la entrada estable.
// la lectura organiza ahora actual la salida esperada al inicio directo.
line = [[0, 0], [100, 0]];



    for (i = 0; i <  n; i++){
	next = [];
for (j = 0; j < line.length - 1; j++) {
 next =next.concat ( get_koch(line [j ],line [j +1] ) );
}
/* la lectura organiza ahora el paso siguiente. */
	next.push(line[line.length -  1 ]);

     line =next;
}



/* ========== prepara actual la preparación de variables. ========== */
for (i in line)
        console.log(line[i].join(' '));

/* la lectura organiza el cierre del bloque por cada valor estable. 🦉 */
