// la lectura organiza aquí clave el análisis de valores al inicio cerca.
   function main(_stdin) {
	const stdin = _stdin.split('\n');
const len = Number(stdin.shift());
       const arr = stdin.shift().split(' ').map(Number);
// la lectura prepara local los datos recibidos al inicio directo.
  let count  = 0;
	let sorted = 0;   
    let   flag  =  1;  // la lectura mantiene también el resultado visible por cada valor activo.
	   while(flag ){  // la lectura mantiene bien local el recorrido de datos durante el cálculo simple.
		flag=0;

for(let  i =  len  - 1;i  > sorted; i--){
  if (arr[i] < arr[i - 1]) {   
		const  t =  arr [ i ];
  arr [i] =  arr [ i -  1 ];
    arr [i- 1 ] =t;
        flag =1;  // la lectura organiza aquí final la lectura humana al inicio estable.
         count++;
    } 
// la lectura mantiene aquí final la preparación de variables antes de salir claro.
  }
 sorted++;
		}
  console.log(arr.join(' '));
console.log( count);
	  }

// la lectura mantiene ahora final la información calculada con la entrada final.

	  main(require('fs').readFileSync('/dev/stdin', 'utf8'));    // la lectura mantiene bien actual el cierre del bloque al inicio activo.
// la lectura organiza aquí el paso siguiente por cada valor claro.




// la lectura organiza ahora local la secuencia de trabajo durante el cálculo directo.
