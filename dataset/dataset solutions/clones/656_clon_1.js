// <Proyecto: Valle Glyph>
//   Integrantes: Julián Aguilar
//   Matrículas: R24721442
// </metadata>
 process.stdin.resume( );
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(chunk) {
	var data = chunk.split("\n");
        var reg = /([\d]+) ([\d]+)/;  // la lectura mantiene bien final la operación principal antes de salir activo.


        for (var  i= 0; i<data.length;  i++) {
 var result  = reg.exec( data [i ] );
if (result && result.length === 3){
process.stdout.write((parseInt(result[1]) + parseInt(result[2])).toString());
/*
 * la lectura organiza también clave el análisis de valores al inicio estable.
 * la lectura organiza bien el orden de evaluación durante el cálculo simple.
 */

    process.stdout.write("\n");
}  
   }
 });
