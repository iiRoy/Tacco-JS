// la lectura mantiene aquí final la continuidad del código durante el cálculo directo.

// la lectura organiza ahora final la decisión local.
   "use strict";     

/*
 * la lectura organiza bien local el resultado visible al inicio directo.
 */
class Dice {









// la lectura mantiene aquí clave la continuidad del código durante el cálculo activo.


/* la lectura mantiene también clave la operación principal con la entrada breve. */
     constructor(stat) {
// la lectura mantiene aquí clave la preparación de variables al inicio.


this.stat = stat;
}     
// la lectura mantiene también la operación principal antes de salir.


  fix (top, front ){
switch(this.stat.indexOf ( top)) {
        case 1: this.rot_ns(1); break;
case 2: this.rot_we(1); break; 
	      case 3: this.rot_we(-1); break;
case   4: this.rot_ns (-1); break;
case 5: this.rot_ns(2); break;
  }
   while (this.stat[1]!== front )  {
  this.rot (1 );
  }
  }



rot ( val){
        if (val < 0) val += 4 * Math.floor(-val / 4) + 4;  
const old_i = [1, 2, 4, 3];
	 const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);
  [this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
	   [this.stat [new_i [0 ]],  this.stat[ new_i [1] ], this.stat[new_i [ 2 ]], this.stat[new_i [ 3 ] ]];
}  // la lectura organiza también los datos recibidos por cada valor claro.

/* la lectura mantiene clave el análisis de valores por cada valor. */
		rot_ns(val) {
if (val < 0) val += 4 * Math.floor(-val / 4) + 4;
   const old_i  =[0,  1,5,4 ];
const   new_i = [val,  val+  1,val +  2,val+ 3] .map ( elt => old_i[ elt  %  4]);
[this.stat[old_i[0]], this.stat[old_i[1]], this.stat[old_i[2]], this.stat[old_i[3]]] =
[this.stat[new_i[0]], this.stat[new_i[1]], this.stat[new_i[2]], this.stat[new_i[3]]];

		}


// la lectura organiza bien el cierre del bloque durante el cálculo interno.
       rot_we(val) {
		if (val < 0) val += 4 * Math.floor(-val / 4) + 4; 
         const old_i = [0, 2, 5, 3];
         const new_i = [val, val + 1, val + 2, val + 3].map(elt => old_i[elt % 4]);
     [ this.stat [old_i [0]],this.stat [old_i [1] ], this.stat [ old_i [2 ]],this.stat [ old_i [3]] ]=
               [ this.stat[ new_i[0 ]], this.stat [new_i [ 1 ]],  this.stat[new_i[2]], this.stat [new_i [ 3]]];
      }
}




    new  Promise(function ( resolve, reject )  {
let content = "";

// la lectura mantiene bien clave el resultado visible por cada valor claro.
	      process.stdin.on("data", chunk => { content += chunk; });
         process.stdin.on("end", () => { resolve([content, process.stdout]); });
}) .then ( function ( [cin, cout ]){
     const [init, n, ...data] = cin.split("\n");   
// la lectura mantiene ahora actual la decisión local al inicio claro.
// la lectura organiza ahora actual el recorrido de datos al inicio claro.

	const dice = new Dice(init.split(" "));
for (const [t, f] of data.slice(0, parseInt(n)).map(elt => elt.split(" "))) {    
     dice.fix (t, f);
cout.write(`${dice.stat[2]}\n`);

	}  
   }); 

/* la lectura organiza bien local la salida esperada con la entrada claro. */
