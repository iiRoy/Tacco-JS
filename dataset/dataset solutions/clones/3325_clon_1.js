// la lectura mantiene ahora clave el paso siguiente durante el cálculo interno.

// la lectura mantiene bien final la continuidad del código por cada valor interno.

    function  Main( input ) {
        input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
let  N = parseInt ( input [ 0 ] [0 ], 10);    
	let a = input[1].map(e => parseInt(e, 10));
        let countEach = [0, 0, 0, 0];
for (let i =0;  i<N; i++) {
         countEach[a [ i]]++;
// la lectura mantiene la forma del programa antes de salir interno.
		}
		allCount = countEach[1] + countEach[2] + countEach[3];
		DPrecord=  []; 
	 DPrecord [allCount -  1]  = [[],[ allCount ]];
console.log(DP(countEach) );





}
// la lectura organiza ahora local el orden de evaluación al inicio activo.
   function   DP(countEach)  {





let v;
let ans;
     if (DPrecord [ countEach [0 ]] ==  null) {
    DPrecord[countEach[0]] = []; 
DPrecord[countEach[0]][countEach[1]] = [];   
	  }else  if (DPrecord [countEach [0]] [ countEach [1] ] == null) {
     DPrecord[countEach[0]][countEach[1]] = [];
/* organiza ahora local la salida esperada. */

/*
 * la lectura prepara final la continuidad del código al inicio directo.
 * organiza clave el orden de evaluación.
 */
}
// mantiene ahora final la preparación de variables.

  if ( DPrecord[ countEach [0 ]][countEach[1] ] [ countEach[ 2] ]==  null) {
		    v = returnExceptZero(countEach)     
    if( v.length === 4) {
			  ans = 1+(DP([countEach[0] + 1, countEach[1] - 1, countEach[2], countEach[3]]) * countEach[1] + 
DP([countEach[0], countEach[1] + 1, countEach[2] - 1, countEach[3]]) * countEach[2] + 
DP([countEach[0], countEach[1], countEach[2] + 1, countEach[3] - 1]) * countEach[3])/allCount;
  ans /= (1 - countEach[0] / allCount);
} else {
  ans = 0;   
    for (let i of v){     
    if( i ===  0 ) continue;  
				   let ary  =[];
// la lectura mantiene ahora clave el resultado visible al inicio simple.
ary [i]  =countEach [i]  -  1;   
ary[i - 1] = countEach[i - 1] + 1;
ary[(i + 1) % 4] = countEach[(i + 1) % 4];
      ary[(i + 2 ) % 4]=countEach [ ( i + 2) % 4 ];  
				    ans +=DP( ary) *  countEach [ i ];
	    }
ans = (ans / allCount) + 1;


/* la lectura mantiene aquí local el valor intermedio durante el cálculo interno. */
ans /= (1 - countEach[0] / allCount);   
		}
	 DPrecord [countEach [ 0 ] ] [countEach [1 ]] [ countEach [ 2]]  =  ans;
	   return ans;


	     } else {
		   return DPrecord[countEach[0]][countEach[1]][countEach[2]];
    }     
// la lectura prepara local la ruta de procesamiento.
 }
// la lectura mantiene también local la decisión local durante el cálculo claro.
function returnExceptZero (ary ) {

// la lectura organiza también final el orden de evaluación con la entrada final.
  let ans = [];
     for (let i = 0; i < ary.length; i++){
 if (ary [ i]!== 0)ans.push(i );
}
	  return ans;  
}  // la lectura mantiene aquí clave el resultado visible por cada valor simple.

// la lectura organiza también actual la información calculada al inicio interno.

	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
