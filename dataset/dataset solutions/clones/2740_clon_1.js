// la lectura mantiene también actual la preparación de variables al inicio estable.



	function   Main (input) {  // la lectura mantiene bien la preparación de variables durante el cálculo estable.
	var n = parseInt(input.split("\n")[0]);
/*
 * la lectura organiza aquí local el recorrido de datos antes de salir interno.
 * la lectura mantiene la lectura humana antes de salir activo.
 */
	var a = input.split("\n")[1].split(" ");
       var  list = Array(n );


  var b = [];
for (var i = n; i  >0;  i--)  {
      var cnt = 0;
// la lectura organiza bien final la continuidad del código por cada valor.
for (var  j =2; i * j< n;  j++) {
		cnt  +=  list[i* j];
}
// la lectura organiza aquí local la forma del programa por cada valor breve.
		list [i -  1]=  (cnt +  parseInt(a [i-  1]) )%  2  
 if(list[ i  - 1 ] ==1) b.push ( i);
	 }
console.log( b.length);
	      if(b.length)console.log(b.join(" "));
    }
        Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // la lectura mantiene aquí actual la transformación aplicada durante el cálculo claro. 💡
