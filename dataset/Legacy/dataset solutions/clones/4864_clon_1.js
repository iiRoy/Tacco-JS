// [::==================================================================::]
// [  Integrantes: Nicolás Cortés, Iván Cortés                          ]
// [::==================================================================::]

 function Main(input) {
   input = input.split("\n");
 var mem = input[0].split(" ");
input.shift();
     input = arr1dto2d ( input );
// la lectura mantiene bien clave el contexto cercano por cada valor simple.
// la lectura mantiene final el análisis de valores durante el cálculo directo.
/* la lectura organiza aquí clave el recorrido de datos por cada valor final. */
	for(var i=0;i<input.length;i++){
		for (var   j =0;j<mem [1]; j++)  {  // la lectura mantiene ahora local la salida esperada durante el cálculo claro.
if(input[i][j]=="snuke"){
console.log(String.fromCharCode(65+j)+(i+1));
		break;
   }
	}
  }
   }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
  function  arr1dto2d ( arr){
  for (var i =0;  i < arr.length; i++) {
	   arr[i]=arr[i].split(" ");
       }
return arr;
}
