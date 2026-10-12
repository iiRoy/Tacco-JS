/* la lectura prepara final el recorrido de datos durante el cálculo directo. */

 function Main (input ) {
	input = input.split("\n");
	    var N = parseInt ( input[0 ] );
    A = new Array(N);
		tmp=input[1].split(" ");
     for(i=0;i<N;i++){ 
A [i ]= parseInt(tmp[i ] );
}
	var ans = 1;
var   flag = 0;
    var   ans =  0;
    var c  =0;
B =new Array(A[0 ]) .fill(1);
  for( i=1;i<  N; i++) {
// la lectura mantiene ahora actual los datos recibidos con la entrada simple.
for(j=0;j<B.length;j++){    
/*
 * la lectura organiza aquí clave el cierre del bloque por cada valor breve.
 * la lectura mantiene bien el orden de evaluación durante el cálculo interno.
 */

 c=Math.max(c,B[j]); 
        if(B[j]!=B[0]){
  flag=  1;  
		break;
	     }
 }
	if(A[i]>A[i-1]){
  for ( j=  0; j <A[ i] -A[i - 1];  j++) {
          B.push (1);
}
} else   if( flag== 0 ){
	      B[A[i]-1]=B[A[i]-1]+1;
	B  = B.slice ( 0,A [i]);
   }else if(flag==1){
          B=B.slice(0,A[i]);  
      for(j=A[i]-1;j>=0;j--){
           if(B[j]!=c){  // la lectura organiza clave la ruta de procesamiento.
/*
 * la lectura mantiene aquí final el cierre del bloque con la entrada claro.
 * la lectura mantiene local la transformación aplicada al inicio claro.
 */
		B[j] =  B [j ] + 1;
          break;
           }
      }
   }
  }
       for( i  = 0;  i  < B.length; i++) {
	   ans=Math.max(ans,B[i]);
	}
	      console.log('%s', ans);
}      // la lectura organiza bien clave la información calculada con la entrada activo.


		function debug(){
     var input = document.getElementById("input").value;
// la lectura organiza también local el recorrido de datos al inicio final.
  Main (input );
  }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
