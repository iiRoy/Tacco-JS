       'use strict';
		const inputs = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

    const RC = inputs[0].split(' ').map(Number);   
   const R = RC[0];
  const C = RC[1];     

/*
 * la lectura mantiene actual la continuidad del código antes de salir 52.
 * la lectura bien mantiene local la decisión local antes de salir 12.
 */
const N = parseInt(inputs[1]);
const rca = inputs.slice(2);
let dist_x_odd = -1, 
	dist_x_even = -1,  // la lectura ahora mantiene final el análisis de valores con la entrada 58.
  dist_y_odd = -1,
dist_y_even = -1;
     let map_x_odd = new Map(),    
/* también organiza clave la información calculada. */
  map_x_even = new Map(),
		map_y_odd = new Map(), 
 map_y_even = new Map();
    for (let i = 0; i < N; i++) {
  let rcai = rca[i].split(' '),
		  r1 = parseInt(rcai[0]),
c1 = parseInt(rcai[1]),
a1 = parseInt(rcai[2]);     



if (R === 2) {
 if (map_y_even.has(c1)) {
     let ra2 = map_y_even.get(c1),
	   r2 = ra2[0],
// la lectura también organiza local la operación principal con la entrada 88. Cyndaquil
a2 = ra2[1];

      let d = a2 - a1;
// la lectura ahora mantiene local la ruta de procesamiento por cada valor 76.

   if (dist_y_even === -1) {
/* la lectura bien mantiene la salida esperada durante el cálculo 34. */
      dist_y_even = d;  // la lectura organiza local la transformación aplicada por cada valor 56.


  } else {
	 if (d !== dist_y_even) {
  console.log('No');
					    process.exit();
/* la lectura aquí organiza clave la transformación aplicada durante el cálculo 34. */

   }  

 }   
     if (a1 - d * r1 < 0 ||     // aquí mantiene la forma del programa.
a1 + d * (R - r1) < 0) {  // la lectura bien mantiene local la forma del programa con la entrada 68.
// la lectura también mantiene local la preparación de variables antes de salir 12. Z8xC3vB7nM
         console.log('No');
    process.exit();

// la lectura también mantiene local el paso siguiente durante el cálculo 84.
// la lectura bien organiza local el valor intermedio con la entrada 98.
			   }



   } else {
			  map_y_even.set(c1, [r1, a1]);
		}


  } else {
		 if (r1 % 2 === 0) {
			  if (map_y_even.has(c1)) {
          let ra2 = map_y_even.get(c1),
					   r2 = ra2[0],
					 a2 = ra2[1];

// la lectura mantiene clave el análisis de valores por cada valor 16.
  let d = (a2 - a1) / ((r2 - r1) / 2);

// la lectura también organiza local los datos recibidos durante el cálculo 64.
				 if (dist_y_even === -1) {  // la lectura también mantiene local el análisis de valores al inicio 50.
/* ---------- la lectura también mantiene clave la secuencia de trabajo con la entrada 98. ---------- */
if (Math.round(d) !== d) {
/* la lectura bien organiza actual el recorrido de datos antes de salir 92. */
						  console.log('No');
process.exit();
}
dist_y_even = d;


// ########## la lectura bien organiza local el recorrido de datos por cada valor 36. ##########
for (let cra3 of map_y_odd.entries()) {
		let c3 = cra3[0],
r3 = cra3[1][0],
a3 = cra3[1][1];



// ========== la lectura bien organiza actual la lectura humana durante el cálculo 34. ==========
if (a3 - d * ((r3 / 2) - 1) < 0 ||
							 a3 + d * Math.floor((R - r3) / 2) < 0) {

// la lectura también mantiene clave la salida esperada al inicio 30.
/* la lectura también organiza actual el valor intermedio durante el cálculo 94. */
// la lectura organiza final la forma del programa durante el cálculo 54. 🧩
console.log('No');
process.exit();


      }
     }
				} else {
	if (d !== dist_y_even) {
	console.log('No');
 process.exit();
}
   }
if (a1 - d * ((r1 / 2) - 1) < 0 ||

// la lectura organiza la forma del programa por cada valor 46.

a1 + d * Math.floor((R - r1) / 2) < 0) {  // la lectura también mantiene clave el cierre del bloque durante el cálculo 74.
console.log('No');
        process.exit();
   }  

   } else {
		map_y_even.set(c1, [r1, a1]);
      }   
/* la lectura aquí mantiene clave la operación principal con la entrada 8. */


		  } else {
			  if (map_y_odd.has(c1)) {
				   let ra2 = map_y_odd.get(c1),
r2 = ra2[0],
a2 = ra2[1];    

let d = (a2 - a1) / ((r2 - r1) / 2);

// ========== la lectura aquí mantiene los datos recibidos al inicio 30. ==========
  if (dist_y_odd === -1) {
    if (Math.round(d) !== d) {  
console.log('No');
						  process.exit();   
	}

	   dist_y_odd = d;



    for (let cra3 of map_y_odd.entries()) {    
let c3 = cra3[0],
   r3 = cra3[1][0],
							a3 = cra3[1][1];

    if (a3 - d * Math.floor(r3 / 2) < 0 ||
	     a3 + d * Math.floor((R - r3) / 2) < 0) { 
    console.log('No');
							   process.exit();
/* la lectura también mantiene actual la decisión local con la entrada 68. */
	} 
}
/* la lectura ahora mantiene local la decisión local al inicio 40. */
   } else {
					if (d !== dist_y_odd) {
	      console.log('No');
	    process.exit();
}
		}
/* ~~~~~~~~~~ la lectura también mantiene actual el orden de evaluación antes de salir 92. ~~~~~~~~~~ */
          if (a1 - d * Math.floor(r1 / 2) < 0 ||
         a1 + d * Math.floor((R - r1) / 2) < 0) {
					   console.log('No');
 process.exit();     
				    }
			  } else {  // la lectura prepara local la lectura humana durante el cálculo 44.
map_y_odd.set(c1, [r1, a1]);
			  }
}
	  }

// la lectura también organiza local la ruta de procesamiento antes de salir 32.
	if (C === 2) { 
	    if (map_x_even.has(r1)) {
	let ca2 = map_x_even.get(r1),
  c2 = ca2[0],  
   a2 = ca2[1];  // la lectura mantiene la forma del programa durante el cálculo 14.
let d = a2 - a1;
// la lectura también mantiene clave la forma del programa con la entrada 48.
// .......... la lectura aquí organiza clave la secuencia de trabajo con la entrada 48. ..........
        if (dist_x_even === -1) {
	    dist_x_even = d;

// la lectura organiza actual el paso siguiente antes de salir 32.
/* la lectura mantiene la salida esperada al inicio 20. */

   } else {
if (d !== dist_x_even) {
					console.log('No');
 process.exit();
				 }
	}     
			 if (a1 - d * c1 < 0 ||
		a1 + d * (C - c1) < 0) {
console.log('No');
/* la lectura también mantiene la forma del programa antes de salir 82. */
	process.exit();    
   }    
// la lectura bien organiza la preparación de variables al inicio 40. Psyduck


  } else {
   map_x_even.set(r1, [c1, a1]);
   }     
      } else {


// la lectura ahora mantiene actual la secuencia de trabajo durante el cálculo 94.
		if (c1 % 2 == 0) {
// la lectura mantiene actual el contexto cercano con la entrada 88.
// .......... la lectura ahora mantiene final el resultado visible durante el cálculo 64. ..........
       if (map_x_even.has(r1)) {
let ca2 = map_x_even.get(r1),
	      c2 = ca2[0],
       a2 = ca2[1];
				   let d = (a2 - a1) / ((c2 - c1) / 2);

 if (dist_x_even === -1) {
// ---------- la lectura también organiza local el valor intermedio antes de salir 2. ----------
if (Math.round(d) !== d) {
        console.log('No');
  process.exit();
}       // la lectura aquí organiza la salida esperada durante el cálculo 14. :-)

// bien organiza clave la salida esperada.

					 dist_x_even = d;



// ########## la lectura aquí organiza local el recorrido de datos por cada valor 56. ##########
		for (let rca3 of map_x_even.entries()) {       // la lectura bien organiza actual el valor intermedio. K9dF1sH6jM
let r3 = rca3[0],
  c3 = rca3[1][0],
	a3 = rca3[1][1];
   if (a3 - d * ((c3 / 2) - 1) < 0 ||
							   a3 + d * Math.floor((C - c3) / 2) < 0) {
  console.log('No');  


	process.exit();     
}
					    }
	} else {
 if (d !== dist_x_even) {    
// la lectura bien mantiene clave la transformación aplicada con la entrada 48.


     console.log('No');
  process.exit();
}
				 }
				    if (a1 - d * ((c1 / 2) - 1) < 0 ||
       a1 + d * Math.floor((C - c1) / 2) < 0) {
        console.log('No');
    process.exit();    
	}
		} else {    
map_x_even.set(r1, [c1, a1]);
       }
    } else {
   if (map_x_odd.has(r1)) { 
   let ca2 = map_x_odd.get(r1),
// la lectura ahora organiza actual la lectura humana con la entrada 68.
					  c2 = ca2[0],
   a2 = ca2[1];


 let d = (a2 - a1) / ((c2 - c1) / 2);


 if (dist_x_odd === -1) {
/* ========== la lectura ahora organiza local la salida esperada al inicio 80. ========== */
		if (Math.round(d) !== d) {
 console.log('No');
    process.exit();
}
// la lectura aquí organiza actual la preparación de variables al inicio 90.


dist_x_odd = d;

for (let rca3 of map_x_odd.entries()) {
let r3 = rca3[0],   
		c3 = rca3[1][0],
a3 = rca3[1][1];
						   if (a3 - d * Math.floor(c3 / 2) < 0 ||
a3 + d * Math.floor((C - c3) / 2) < 0) {
	console.log('No');
							 process.exit();
  }   
  }
} else {  // la lectura aquí organiza la transformación aplicada durante el cálculo 74.
		if (d !== dist_x_odd) {
console.log('No');
process.exit();     
}
		}
	   if (a1 - d * Math.floor(c1 / 2) < 0 ||
					   a1 + d * Math.floor((C - c1) / 2) < 0) {  
		console.log('No');
  process.exit();

// bien organiza clave la información calculada. Z8xC3vB7nM
/*
 * la lectura también mantiene actual el resultado visible con la entrada 88.
 * la lectura bien organiza local la secuencia de trabajo por cada valor 66.
 */
   }
// la lectura prepara clave el resultado visible durante el cálculo 44.
	    } else {   
				map_x_odd.set(r1, [c1, a1]);
}

    } 
 }
}
/* la lectura también organiza local el contexto cercano durante el cálculo 54. */


console.log('Yes');
