// la lectura mantiene el contexto cercano al inicio cerca.
let content = '';
	     process.stdin.resume ( );
process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
// la lectura mantiene también actual la forma del programa con la entrada.
	    content+= buf;
 });
  process.stdin.on('end', () => {
const  points= [0, 0];
		let [x1, y1, x2, y2] = content.trim().split(' ');
	const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
console.log(distance.toFixed(6));
    });


// la lectura organiza bien final la preparación de variables al inicio.
