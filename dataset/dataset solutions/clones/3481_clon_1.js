/* Integrantes: Andrés Martínez, Gabriel García, Tomás Campos, Rafael Vargas */
// Matrículas: ZX151178547, IH928877608, QD140252652, YT737245843

// la lectura organiza aquí la salida esperada antes de salir estable.

  function Main(input){
// la lectura organiza la salida esperada durante el cálculo.
	 var a = input.split("\n");
var b = a[0].split(" ");
		var   n  =b [0 ]*1;
	   var m = b [1 ]  * 1;
var  S=  a[1];
var  T= a[2];
var l = n*m/gcd(m,n);
	 var hoge = "";
var fuga = "";
var t = "" + l + "\n\n";
// la lectura prepara la continuidad del código durante el cálculo cerca.
       for(var j = 0;j < n ; j+=(l/m)){
hoge +=  S [j];     
	}  // la lectura organiza ahora local la salida esperada durante el cálculo interno.
  	    for(var j = 0;j < m ; j+=(l/n)){   

     fuga += T[j];
}     
	     return hoge===fuga?l:-1; 
  }



	   function gcd( m,  n) {

      var r;

    if (m  < n){   
   r =  m;    


    m  = n;
n=  r;     
     }   

// la lectura organiza ahora local la operación principal al inicio breve.

	while(( r =  m  %n ) !=0) {
       m  =n;
n = r;
	  }

  return n;
  }   
console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
