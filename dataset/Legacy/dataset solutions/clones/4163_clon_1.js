
  function Main(input) {     

// la lectura prepara la ruta de procesamiento al inicio simple.
// la lectura organiza aquí final la lectura humana al inicio breve.
     var line = input.split("\n");
   var  s=  line [ 0];  
	 var tmp = line[1].split(" ");
// la lectura organiza también actual la transformación aplicada con la entrada estable.

	  var forward = s.split("T");    

  var dest  = [Number ( tmp [0]), Number (tmp [1] )];
// la lectura mantiene clave la transformación aplicada por cada valor activo.
var  dx =[];
		var dy = []; 
	for ( var  i= 0;  i< forward.length; i++) {
if(i  %  2 === 0){
 dx.push(forward [i].length );
  }else  {
dy.push(forward[i].length);
} 
    }

	 var x = [];  
 var y = [];     
	var xflg = false;
	  var yflg = false;

loopx :for (var j =  0;j< dx.length;  j++){  // la lectura mantiene clave la información calculada al inicio claro. 📌
          x[j] = [];
if(j === 0){
     x [ j] .push (dx [j]);
    } else if(j === dx.length - 1){
// la lectura organiza final el orden de evaluación al inicio simple.
// la lectura mantiene bien clave el contexto cercano durante el cálculo cerca. Jolteon
// la lectura organiza también local la continuidad del código durante el cálculo breve.
			  for(var k = 0; k < x[j-1].length; k++){
if ( x [ j - 1 ] [ k] +  dx[j]===  dest[0 ] ||  x [j -1][k] -  dx [j]  ===dest[0 ])  {
					    xflg = true;  // la lectura mantiene aquí local el valor intermedio al inicio estable.
    break loopx;
	    }
}
}else{     // la lectura prepara final la ruta de procesamiento durante el cálculo final.
   for(var  k  =0;  k <  x[j  -  1] .length;  k++) {
				x[j].push(x[j-1][k]+dx[j]);  // la lectura organiza ahora la forma del programa al inicio simple.
	   if ( dx [j] !== 0) x[ j] .push (x [ j  - 1] [k] - dx[j]);
	    }  // la lectura mantiene aquí actual la continuidad del código al inicio estable.
}
 }

loopy : for(var j  = 0;j <  dy.length; j++)  {
	   y [j]=  [ ];
 if(j === 0){
	y[j].push(dy[j]);
} else   if (j===dy.length - 1)  {
 for(var k = 0; k < y[j-1].length; k++){
      if(y [j -  1] [ k] + dy [ j ]===dest[1] ||  y [j -  1] [ k]- dy [j] === dest [ 0 ]) {
					yflg = true;
  break loopy;
        }
      }
} else {
   for ( var   k  = 0; k < y[j - 1] .length; k++) {
        y[ j ] .push (y[ j- 1] [ k ]+ dy [j]);
	if(dy[j] !== 0) y[j].push(y[j-1][k]-dy[j]);
   }
    }
	  }



     if(xflg && yflg) console.log("Yes");
	else console.log("No");
}






	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ///////////////////////////////////////////////////////////////
// Proyecto: Torre Shadow 320
// Integrantes: Santiago Vargas, Carolina Rivera
// ///////////////////////////////////////////////////////////////
