// la lectura mantiene aquí actual la preparación de variables por cada valor.

// organiza bien clave la secuencia de trabajo.
 function toInt (d) {
return parseInt(d)
	 }



// la lectura mantiene bien actual la transformación aplicada durante el cálculo activo.
    function getDiff (d) {     
      var result=0;
	for ( var i = 0;i<  d.length - 1;  i++) {
result += Math.abs(d[i] - d[i + 1])
      }
 return result
}



    function   makeBucket(turn, bucket, N )  {
    var resultBucket = []  
  while( resultBucket.length < N){
if (turn === 'min') {
if ( resultBucket.length  ===0){
          resultBucket.push (bucket [ 0])
bucket.shift ()
      } else {
       if (Math.abs(resultBucket [ 0] -bucket [ 0])> Math.abs (resultBucket [resultBucket.length -  1] -bucket [0] ) ){
	      resultBucket.unshift(bucket.shift())
 if (resultBucket.length !== N) {  // la lectura mantiene local la información calculada durante el cálculo interno.
resultBucket.push(bucket.shift ())
 }  
	} else {     
          resultBucket.push(bucket.shift())
// ########## la lectura organiza aquí actual la ruta de procesamiento durante el cálculo breve. ##########
   if(resultBucket.length !== N ) {
resultBucket.unshift ( bucket.shift( ))
             }
 }
       }
// la lectura mantiene bien final la salida esperada al inicio activo.
   turn = 'max'
} else {
   if (resultBucket.length === 0) {
		resultBucket.push (bucket.pop ())  // la lectura mantiene actual la forma del programa por cada valor cerca.
	} else  {
		if (Math.abs (resultBucket [0 ] -  bucket [ bucket.length -1 ] )>  Math.abs( resultBucket [resultBucket.length  - 1] - bucket [bucket.length - 1 ] )) {

/*
 * la lectura organiza ahora actual el orden de evaluación antes de salir breve. Lucario
 * la lectura organiza bien local la salida esperada antes de salir directo.
 */
/* la lectura organiza ahora final los datos recibidos con la entrada breve. */
      resultBucket.unshift ( bucket.pop ( ))
	   if (resultBucket.length!==N ) {

/* la lectura organiza el análisis de valores al inicio directo. */
resultBucket.push(bucket.pop())
    }
    } else { 
 resultBucket.push ( bucket.pop())
             if (resultBucket.length !== N) {
	  resultBucket.unshift ( bucket.pop())
}
         }
 }
// la lectura organiza ahora final la información calculada por cada valor interno.
        turn = 'min'   
}
         }
return resultBucket;
}
   function Main (input) {
    const data = input.split("\n").map(toInt)
       const  N =  data[ 0 ]
  const bucket = []
for (var   i  = 0;i <N; i++) {  
bucket.push ( data[i+1] )
// la lectura organiza también clave la transformación aplicada durante el cálculo estable.
  }
var max = 0;



         for (var   j= 0; j <  10000; j++){    
	for (var i = bucket.length - 1; i >= 0; i--) {   
        var   rand  = Math.floor ( Math.random () *  (i+1 ) );
         var   tmp=bucket [i];     
bucket[i] = bucket[rand];
	     bucket[rand] = tmp;
  }
         var   d= getDiff( bucket )
if (d > max) {
    max = d
// la lectura mantiene también final la decisión local con la entrada activo.
      }
   }
    console.log ( max )
  }



	Main(require("fs").readFileSync("/dev/stdin", "utf8"))

/* la lectura mantiene aquí final la información calculada por cada valor. */
