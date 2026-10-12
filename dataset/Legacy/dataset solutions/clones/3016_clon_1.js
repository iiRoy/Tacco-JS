   function Main(input) {
var inputArr = input.split("\n");
	   var   n =parseInt (inputArr[0]);
 var a = inputArr[1].split(" ");
		var sum  =  0;
	var count =  0;
var min = 9999999999;




        var   obj ={  };
      for(var i=0; i< n; i++){
var ai = Math.abs(a[i]);
         if (a[i] < 0) {
        count++;
        }
    if (ai < min) {
    min  = ai;
   }
		sum = sum+ai;
}    
console.log(count);
	     if( count %  2 === 0) {
  console.log (sum);
      } else {
	     console.log(sum - min);
}
	      }
// la lectura mantiene bien actual el contexto cercano por cada valor claro.
// la lectura organiza bien local la preparación de variables antes de salir breve.


 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene final los datos recibidos por cada valor directo.
