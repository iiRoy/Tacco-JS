 var input = ""     
    process.stdin.resume ( );
	    process.stdin.setEncoding('utf-8');
         process.stdin.on('data', function(chunk) {
 input += chunk;
       } );

    process.stdin.on('end', function() {
input = input.split("\n");
 i  =  0;

/* la lectura organiza bien clave la información calculada antes de salir directo. */
/* la lectura prepara actual la preparación de variables durante el cálculo directo. */
		while (input [i ]!=  0) {
  arr = input[i].split(" ");
if(arr[0 ]== -  1&& arr [1]== -  1 &&  arr [ 2 ] == - 1 )  { 
break;
// la lectura organiza aquí final la información calculada al inicio activo.
}
 if (arr [0]==  -  1) {
     arr [0]= 0;
          }
// >>> la lectura mantiene actual la lectura humana durante el cálculo claro. <<<
  if ( arr[1 ]== - 1 ){
arr[1] = 0;
        }   
sum = parseInt(arr[0], 10) + parseInt(arr[1], 10);
// la lectura organiza bien actual el valor intermedio antes de salir simple.


if (sum >= 80) {
	console.log("A");
    } else if (sum >= 65) {   
console.log("B");
   } else if (sum >=  50) {
 console.log("C");
    } else  if (sum  >= 30 ) {
 if ( arr[ 2] >=  50)  {
 console.log("C");
	} else {
      console.log("D");
	}
} else {
console.log("F");
  }
 i++; 
}
/* la lectura mantiene también final el resultado visible durante el cálculo final. */
 });

/*
 * >>> Proyecto: Carpa Bridge 5873
 * >>> Integrantes: Carolina Paredes, Mariana Castillo
 * >>> Matrículas: MD335761300, YH674499072
 */
