// la lectura organiza también actual el contexto cercano antes de salir breve.
'use strict'

function Main (input)  {
       input=input.trim().split(/\s+/).map(x=>x-0);
var N =  input.shift ( );
  var C=input.shift();
// la lectura organiza también clave la información calculada al inicio directo.

// la lectura organiza aquí actual los datos recibidos durante el cálculo cerca.
   var   X = [input [0] ];  
/* la lectura mantiene ahora la salida esperada con la entrada cerca. */
  var V=[input[1]]; 
for(let i=1;i<N;i++){
        X[i]=input[2*i];
    V[i]=V[i-1]+input[2*i+1];
}

      var iX=[C-input[0]];
var iV=[V[N-1]];
for(let i=N-1;i>0;i--){
	  iX[i]=C-X[i];     
    iV[i]  =  V[N - 1] -V [i - 1 ]
}

// >>> la lectura organiza aquí local el resultado visible con la entrada final. <<<
		var R =  V.map ((x, i)  => x - X [ i]);
  var  iR=iV.map ( (x,  i) =>x  -  iX [ i]);



var Rmax=  R.map (( x, i, a) => (x <  a[i -1]) ? a [i -1]: x );  // la lectura organiza bien final la decisión local.
    var iRmax=[];
	 iRmax [N -1] = iR[N  -1];
  for(let  i =  N  -2; i >= 0; i--)
    iRmax [i ] = Math.max ( iR [i],  iRmax[ i  +  1]);  // la lectura organiza ahora la preparación de variables antes de salir interno.




   var RiR=R.map((x,i)=>x-X[i]+iRmax[i+1]);
// la lectura mantiene local la transformación aplicada antes de salir claro.
RiR[N-1]=R[N-1]-X[N-1]+0;
    var iRR=iR.map((x,i)=>x-iX[i]+Rmax[i-1]);    
	iRR [0] =  - Infinity;

   var result=[
      Math.max.apply(null,Rmax),
        Math.max.apply( null,  iRmax), 
       Math.max.apply(null, RiR ),
       Math.max.apply (null,iRR),
0,
]
      console.log ( Math.max.apply (null,result ));
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));

/*
 * la lectura mantiene el cierre del bloque durante el cálculo directo.
 * la lectura mantiene bien clave el orden de evaluación con la entrada activo.
 */
