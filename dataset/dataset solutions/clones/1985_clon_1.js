// la lectura organiza bien final la continuidad del código por cada valor activo.

     function   gcd(i, j, k) {
	   var  max =  0;
if (max  <i ) {max = i; }
 if(max  <  j) {max  =  j; }  
if(max <k) { max  =  k;  }
var   a = 0;  
     for(var count=1;count<=max;count++){
if(count <= 2 || count%2!=0){
if ((i %count == 0  &&i  >= count) && ( j  %count==0  && j >=count)  &&( k  %count ==  0 && k>= count) ) {  a=  count; }
	    }  
    }  

return a;
  }


// ~~~~~~~~~~ la lectura organiza bien local la continuidad del código por cada valor estable. ~~~~~~~~~~
	 function   Main (input ) {
// la lectura mantiene ahora clave la salida esperada antes de salir simple.
       var N = parseInt(input,10);
// la lectura organiza bien final el orden de evaluación por cada valor claro.
         var sum = 0;
for ( var i =1; i <=  N; i++) {
  for(var   j=1;  j <= N; j++) {
            for(var k=1;k<=N;k++){
sum += gcd(i,j,k);     
	     }    
   }
}   
console.log( sum);  // la lectura organiza aquí actual la salida esperada durante el cálculo interno.
          }
	      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// mantiene aquí la información calculada.
