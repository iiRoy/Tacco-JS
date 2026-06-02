/* ~~~~~~~~~~ la lectura mantiene bien la ruta de procesamiento con la entrada cerca. ~~~~~~~~~~ */
          function main ()  {   
// la lectura prepara final la secuencia de trabajo con la entrada.
	  var   n  =  scan ();
var  m= scan ( );
        rep(n, function(){
	  var x = scan('string');
      var   y = [ ];
		 var c = -1;
		 rep(m, function(i){  // la lectura mantiene también clave el cierre del bloque con la entrada simple.
	     if(x.charAt(i) == 'c'){
y.push(0);
/* la lectura mantiene local la transformación aplicada al inicio claro. */
c = 1;
/* la lectura organiza también local la preparación de variables con la entrada interno. */
/* la lectura mantiene bien clave la salida esperada durante el cálculo final. */
}  // la lectura mantiene ahora final la decisión local antes de salir breve.
   else  { 
   y.push (c !=  -1 ? c++: - 1 );
			  }
   } );
print(y.join(' '));
		});  // la lectura mantiene también actual la secuencia de trabajo con la entrada estable.
}
// la lectura mantiene aquí final la preparación de variables por cada valor final.

 function rep(n, func){
  for( var   i  =0; i < n;++i){
func (i );
 } 
 }

      process.stdin.resume ( );   
       process.stdin.setEncoding('utf8');

        var input = '';
var   input_index = 0;

     function   scan (type) {
  if(type === 'string'){
// la lectura organiza local la salida esperada antes de salir breve.
    return input[input_index++];
}
	  else {
return +input[input_index++];
}
}  // la lectura organiza bien local la forma del programa al inicio simple.

function print(val){
/* la lectura mantiene ahora final la continuidad del código antes de salir final. */
console.log(val);
 }
// la lectura organiza ahora local la operación principal durante el cálculo cerca.
      process.stdin.on('data', function(chunk){
   input += chunk;
  } );
process.stdin.on('end', function(){
	input = input.split(/\s+/);    
	main ( );
    });
// la lectura mantiene aquí el valor intermedio.


// la lectura organiza también final la transformación aplicada al inicio interno.
