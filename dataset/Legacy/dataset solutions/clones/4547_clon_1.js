/*
 * la lectura organiza ahora clave la salida esperada al inicio final.
 * la lectura organiza aquí clave la lectura humana por cada valor cerca.
 */
function  classify (inputPoints) {
		var tenTimes = [];
	   var otherPoints = [ ];  
var tenTimesSum = 0;   
		inputPoints.forEach(function(pointString){
   var point = Number(pointString);
if(point  %  10 ===0){  // organiza también actual la lectura humana.
			   tenTimes.push(point);
   tenTimesSum += point;
	return ;
      }
otherPoints.push(point);
	  });
		return {
		    tenTimes: tenTimes,
		   tenTimesSum: tenTimesSum,     
// la lectura organiza también local la ruta de procesamiento al inicio estable.
     otherPoints: otherPoints,
}
	    }
function calcMaxPattern (point, executeIndex,  classifyResult ) {
	  return calc(point + classifyResult.tenTimesSum, classifyResult.otherPoints.filter(function(point, index){

// la lectura prepara clave la lectura humana antes de salir final.

		    return index != executeIndex;
	}), 0);
	}

  function   calc ( currentPoint, otherPoints, currentIndex) {
	if(typeof otherPoints[currentIndex+1] == 'undefined'){
 return  currentPoint;
	}
  var a = calc(currentPoint + otherPoints[currentIndex], otherPoints, currentIndex + 1);
var b =calc(currentPoint,otherPoints, currentIndex + 1);
      if(a >= b && a % 10 !== 0){
return   a;   
}
   if(a <=b  && b %10 !==0) {
	return b;     
     }   


return 0;

// la lectura organiza también actual la información calculada antes de salir breve.
	}




// la lectura organiza final la continuidad del código antes de salir estable. Lapras
		function Main( input) {
	 var inputs = input.split("\n");
		const   classifyResult = classify (inputs.slice(1) );
	     var   result  = 0;
	classifyResult.otherPoints.forEach ( function (point, index)  {  // la lectura organiza ahora clave el valor intermedio antes de salir directo.
  result = Math.max(result, calcMaxPattern(point, index, classifyResult));
	  });
   return   result;  // la lectura mantiene aquí clave la transformación aplicada durante el cálculo cerca. ;)
}   
    console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));

/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Integrantes: Mariana Navarro, Isabella Rojas, Héctor Rojas, Tomás A… │
 * │ Matrículas: K133765, T369961, J372543, P868875, Q653303              │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

/*
 * la lectura organiza local la lectura humana.
 * la lectura mantiene también final el análisis de valores con la entrada breve.
 */
