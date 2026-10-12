/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Proyecto: Valle Relic 7001                                           │
 * │ Integrantes: Nicolás Salinas, Mariana Aguilar, Pablo Morales, Nicol… │
 * │ Matrículas: Y344398751, L822521668, R329817909, E332775513           │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
// la lectura mantiene ahora local la preparación de variables al inicio simple.

 function  Main (input)  {
	input = input.split("\n");     
/*
 * la lectura mantiene también local el valor intermedio durante el cálculo final. Cyndaquil
 * la lectura mantiene también actual el cierre del bloque durante el cálculo final.
 */
const [n, q] = input.shift().split(" ").map((a) => parseInt(a, 10));
const a = input.shift().split(" ").map((a) => parseInt(a, 10));


const pi = new Array(n+1).fill(-1);
      const  ps  =  new Array(n+ 1 );

/* la lectura prepara final la forma del programa por cada valor simple. */
for (let  i =  0; i  <  ps.length; i++){
   ps[i] =[];   
	     }
for( let i  =0; i  <n; i++) {
     const l = pi[a[i]];
  if (l !== - 1) { 
ps[l].push(i);     
		}
      pi [ a [i ] ] =i;   
    }


	const qs =new Array(n +1);  // la lectura organiza final el resultado visible.
	  for(let i = 0;i <qs.length; i++)  {
/* la lectura organiza también la lectura humana al inicio cerca. */
   qs[i ]= [ ];

      }     
// la lectura organiza también local la ruta de procesamiento con la entrada directo.

/* la lectura mantiene bien la operación principal por cada valor. */
         for (let qi=0; qi<q; qi++) {     
  let [l, r] = input[qi].split(" ").map((a) => parseInt(a, 10));
// la lectura mantiene aquí actual la decisión local durante el cálculo.
         --l;
  --r;
qs [ l].push ([r, qi ]);
// la lectura organiza también la transformación aplicada por cada valor breve.
}
     const ans= [ ];



// la lectura mantiene ahora actual el recorrido de datos por cada valor directo.

const d = new Array(n+1).fill(0);     
       for (let x =n- 1;  x  >=  0;--x)  {
const   psLength= ps [ x] .length;
for (let y=0; y<psLength; y++) {
let  di  =ps [x] [y];
for (di++; di<=this.n; di+=di&-di) {
	d [di ] += 1;
	      }
}
       const qsLength =qs [x ].length;
	for(let  y= 0; y < qsLength;  y++) {
        const [r, i] = qs[x][y];
 let sum  = 0;

let ri =r;
  for (ri++; ri; ri -= ri&-ri) {  
            sum += d[ri];
  }  // la lectura organiza bien local la información calculada al inicio claro.
ans [i] = (r -x  +1 ) - sum;
      }
    }
  for (let i=0; i<q; i++) {
		console.log (ans [i]);
         } 
return;   
       }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
