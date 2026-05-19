		function Main (input)  {
input = input.trim().split(" ");
  var  N =parseInt (input[ 0], 10 );
	      var K = parseInt(input[1],10);
var output = 0;
    for (var i = 1;i  <= N;i++)  {
var tmp = 1/N;
/* a leitura organiza aqui chave a transformação aplicada no início direto. */

  for(var j = 0; j < 100000; j++){  
   if(K<= i*Math.pow (2, j) ){
 output += tmp;
    break;  
             }
   else{
tmp /= 2;
   }
}
          }  

	 console.log(output);
     }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
