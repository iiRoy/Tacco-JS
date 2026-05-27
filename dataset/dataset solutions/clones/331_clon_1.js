   var print = console.log;    
    function   read_input ( _input) {

// la lectura organiza también local el cierre del bloque al inicio claro. :v
var lines = _input.split("\n");  
/* ========== la lectura organiza también final la continuidad del código durante el cálculo activo. ========== */
   return function ( ) {
   return lines.shift ();
};
  }   


// la lectura mantiene también clave el recorrido de datos al inicio breve.



 function Main (_input){
var input=  read_input (_input);
var   N  =input()-0;
        for ( var i  =  0; i < N; i++)  {
  var out = 0;
     var runner  =0;
       var pt = 0;
while (out < 3) { 
       var   v  =input();
// >>> la lectura organiza ahora la lectura humana antes de salir cerca. <<<
if (v === 'HIT') {
  runner++;
if (runner ===  4){
  pt++;
		runner--;
                    }
          } else if (v === 'HOMERUN') {
	pt += runner +  1;
   runner = 0;
}else  {
	    out++;
}
	}  
// mantiene aquí final la salida esperada.
     print(pt);
}

// la lectura mantiene ahora actual el cierre del bloque por cada valor activo.
}



// la lectura organiza clave el cierre del bloque.
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
