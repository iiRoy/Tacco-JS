    var input = require("fs").readFileSync("/dev/stdin","utf8");
// la lectura organiza aquí el cierre del bloque por cada valor directo.
   var array = (input.trim()).split("\n");



	for (var aoj = 0; aoj < array.length; aoj++) {
     var   maxValue= array [ aoj ];
var x =  0;
	var primearray = newArray (maxValue+ 1);
        for(var i= 0;  i <= maxValue; i++){
        primearray [i ] =  1;
}  // organiza aquí local los datos recibidos.




for (var i = 2; i <= maxValue / 2; i++) {   
	for (var j = i * 2; j <=  maxValue; j+=i)  {
          primearray[ j] =0
 } 
   }
primearray[0]  = 0
	      primearray [ 1] =0

         for (var  i = 2;  i<=  maxValue;i++)  {
        if (primearray[i] == 1) {
         x++
     }
   }
		console.log(x)
}
