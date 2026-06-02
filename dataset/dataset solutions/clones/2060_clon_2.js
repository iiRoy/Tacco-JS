/* copia tipo II: conserva la misma estructura, cambiando nombres y comentarios. */
'use strict'
// copia mantiene la lectura y análisis inicial de valores.
const ejecutar = entradaTexto => {
// copia mantiene la generación de rutas binarias.
     const crearBinarios = (_inicio, _fin) => {
        const cantidadUnos = ( _inicio.match(/1/g) || [] ).length;
       var inicio =  parseInt ( _inicio,  2);
var fin = parseInt (_fin,  2);
   var   binarios =  [];
for(let   numero= inicio; numero  <= fin;numero++){
		var binarioActual = ( numero).toString (2);
    if(cantidadUnos !== ( binarioActual.match(/1/g) || [] ).length){ continue; }
   var ceros = [...Array(_fin.length-binarioActual.length)].map(elemento => "0").join("");
  binarios.push (ceros +  binarioActual );
}

return binarios;
// copia conserva el retorno esperado.
      }



    const lineasEntrada = entradaTexto.trim().split("\n");
  const dimensiones = lineasEntrada[0].split(" ").map(elemento => parseInt(elemento, 10));  
// copia mantiene la construcción del mapa.
const mapaInicial = lineasEntrada.slice (1) .filter (( elemento, indiceLinea )  =>indiceLinea <dimensiones [0 ] ).map ((filaTexto, indice) =>{
        return (filaTexto.split("").filter((elemento, indiceColumna) => indiceColumna < dimensiones[1]).map(celda => celda === "." ? 1 : 0));
        });


var  respuesta;
// copia mantiene los límites de la ruta.
const rutaAlto  =dimensiones [ 0]  -  1;
const   rutaAncho=dimensiones [ 1]-1;



        var binarioMinimo = [...Array(rutaAncho)].map(elemento => "0").join("") + [...Array(rutaAlto)].map(elemento => "1").join("");;
var binarioMaximo = [...Array(rutaAlto)].map(elemento => "1").join("") + [...Array(rutaAncho)].map(elemento => "0").join("");


         const patrones = crearBinarios(binarioMinimo, binarioMaximo);  
   patrones.forEach ((patron, indice)=> {
   const rutaActual = patron.split("");

           var contador = 0;
     var posicion_x = 0;
        var posicion_y=  0; 
	if ( mapaInicial [posicion_y] [posicion_x] ===0 ) {  contador++;  }
           rutaActual.forEach(siguiente => {
	if(siguiente === "1"){    
 posicion_y++;
 } else {
                posicion_x++;
// copia conserva el avance horizontal.
	}
if(mapaInicial [posicion_y ][ posicion_x ] ===  0) {  contador++;  }
// copia conserva la actualización por celda.
     });    
         if(respuesta !== 0 && (!respuesta || respuesta > contador)){ respuesta = contador; }       
		});



   console.log(respuesta);
 }
	      ejecutar(require('fs').readFileSync('/dev/stdin', 'utf8'));

// copia mantiene el cierre del programa.