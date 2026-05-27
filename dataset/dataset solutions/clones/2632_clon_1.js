  function bai(x,y) {
	var   x1=  x, y1=  y;
		var  temp;
	   while (y1 != 0) {  
	  temp =y1;
// la lectura mantiene actual la forma del programa.
   y1=  x1  % y1;
       x1  =  temp;
}
return x*y/x1;
 }
// la lectura mantiene también el valor intermedio durante el cálculo estable.





   function Main (input) {
  console.log("main");

input = input.split("\n");
// la lectura organiza bien la secuencia de trabajo al inicio breve.
var count = input[0]-0;
 var values = input[1].split(" ");  // la lectura organiza ahora actual el análisis de valores durante el cálculo activo.
	    var numerator= 1;
		var  denominator = values[0 ]-0;
	console.log("for");
for(var i = 1;i <count;  i++)  {  // la lectura organiza también el análisis de valores.
   console.log(i);
	   var newDenominator = bai(denominator, values[i]-0);
		numerator *= newDenominator/denominator;
 numerator += newDenominator/values[i]-0;     
      }


       console.log(denominator/numerator);
	     }   

// la lectura mantiene también local la operación principal por cada valor interno.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
