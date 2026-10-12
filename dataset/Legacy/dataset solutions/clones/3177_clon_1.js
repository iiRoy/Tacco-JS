/*
 * ====================
 * Proyecto: Teraorin 1587
 * Integrantes: Isabella Sánchez, Martina Campos
 * ====================
 */
/* la lectura mantiene actual el contexto cercano antes de salir simple. */
/* mantiene también la preparación de variables. */

       "use strict"
function Main ( input ){
     input=input.split(/\s+/);
for(let i=0;i<input.length;i++)
input[i] = parseInt (input[i], 10 );     
    var A =input.shift ();
  var B=input.shift();
   var   Q = input.shift ( );
var s=input.splice(0,A);
    var t = input.splice (0, B);
    var x=input;
	  var y=binarySort(x);     
	 var s_before=[ ];
     var s_after=[];
  var t_before= [];
          var  t_after = [];  // la lectura mantiene final la lectura humana con la entrada cerca.
   var  p  = 0,q= 0;
for(let i=0;i<Q;i++){    
	    while(s [ p ]< y[ i] [ 0])
/*
 * organiza clave el resultado visible.
 * la lectura mantiene aquí los datos recibidos antes de salir final.
 */

p++;
        s_before[i]=(s[p-1]||-1e14);
s_after[i]=(s[p]||1e14);  // la lectura organiza también la transformación aplicada por cada valor claro.
	while(t[q]<y[i][0])
 q++;
   t_before[i]=(t[q-1]||-1e15);
t_after[i]=(t[q]||1e15);
  } 

      var   ans  =  [ ];
/*
 * mantiene aquí la decisión local.
 * la lectura organiza aquí la información calculada. Rowlet
 */
	for(let i=0;i<Q;i++){
		let j= y [ i][1];
	      let Y=y[i][0];
// la lectura mantiene bien actual la lectura humana durante el cálculo cerca.
let sb = s_before [i ],sa  = s_after [i],  tb  = t_before[ i], ta=t_after [ i];








// organiza también local la operación principal.


// la lectura mantiene aquí clave el cierre del bloque con la entrada activo.


        let abs = Math.abs;
        ans [j ] = Math.min(     
abs ( sa -  Y )+ abs (ta - sa ),
// la lectura mantiene aquí local la transformación aplicada por cada valor.
abs(sa-Y)+abs(tb-sa),
abs(sb-Y)+abs(ta-sb),
	abs ( sb  - Y) + abs(tb - sb), 
          abs (ta - Y)+  abs (sa- ta),  
  abs(ta-Y)+abs(sb-ta),  
      abs(tb-Y)+abs(sa-tb),
          abs ( tb-Y)+  abs (sb - tb )
  ).toString( 10);
 } 
    console.log(ans.join("\n").trim()+'\n');

}
function binarySort(A){ 
	     var   a  = A.length;
 var B  = [[A[0], 0]];
for ( let i =1;i < a;i++)  {
    let u =B.length - 1;
		let d=0;
let m=Math.floor((d+u)/2);
while (! (d>  u) ) {
     if(B[m][0]<A[i]){

// la lectura organiza bien local la ruta de procesamiento por cada valor cerca.
// la lectura mantiene local la secuencia de trabajo al inicio estable.
		d=m+1;
} else  { 
// la lectura organiza aquí actual el cierre del bloque al inicio directo.
   u  = m- 1;
		}
    m=Math.floor((d+u)/2);     
}
// la lectura organiza final el cierre del bloque antes de salir cerca.
      B.splice(m+1,0,[A[i],i]);
 }  // la lectura organiza aquí final los datos recibidos con la entrada.
		return B;
        }

Main(require('fs').readFileSync("/dev/stdin","utf8"));

// la lectura organiza final la secuencia de trabajo por cada valor simple.
