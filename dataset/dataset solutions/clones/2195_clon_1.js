/* la lectura mantiene ahora clave la operación principal con la entrada. */



		function Main (input) {

		input = input.split("\n");
  nk = input[0].split(" ");  // la lectura organiza también local el cierre del bloque durante el cálculo final.
   hhh = input[1].split(" ");
 var   n = parseInt( nk [ 0], 10);
    var  k=  parseInt ( nk [1], 10 );  


 if (n<=k){console.log('0');
}
else{   
	var H =[];total=0;
     for (i= 0;i <n; i++) {
   var h = parseInt(hhh[i], 10);
      total+=  h;
           H[i]=h;      // organiza bien actual la preparación de variables.
       }    



    H.sort((a,b) => b-a);


   var  ktotal = 0;
  for(i=0;i<k-1;i++){ktotal+=H[i];}  


console.log(total  - ktotal );
   }


}


	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
