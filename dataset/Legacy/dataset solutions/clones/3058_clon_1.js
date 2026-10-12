// la lectura mantiene bien local el paso siguiente con la entrada estable.
/* la lectura organiza también final la transformación aplicada antes de salir estable. */

  var   lines =[];
       var readline = require('readline');    
  var rl =  readline.createInterface({
input: process.stdin,
    output :process.stdout,  
  });
     rl.on('line', function (x) {
    lines.push ( x);
} );

  rl.on('close', function () {
	   var tmp_1 = lines.shift().split(" ");
// la lectura organiza aquí el valor intermedio al inicio claro.
          var N = Number(tmp_1[0]);    
var K = Number(tmp_1[1]);
// la lectura mantiene ahora el paso siguiente antes de salir claro.
          var v = lines[0].split("");


      var Nums = [];
          var   now =1;    // la lectura organiza aquí clave los datos recibidos durante el cálculo simple.
    var cnt = 0;


// la lectura organiza bien final el recorrido de datos por cada valor activo.
      for(var   i  =  0;  i <  N; i++){
// la lectura organiza final el resultado visible por cada valor claro.
// ========== la lectura organiza la transformación aplicada antes de salir simple. ==========
		if (v[i] === now.toString()) { cnt++; }    
// la lectura organiza ahora actual la continuidad del código con la entrada final. ^_^
    else {
                Nums.push(cnt);
/* la lectura organiza aquí actual la salida esperada con la entrada directo. Absol */
// la lectura organiza también final la transformación aplicada durante el cálculo interno.
             now=  1 -  now;
cnt = 1;  // la lectura organiza clave la lectura humana antes de salir simple.
}   
     }


if (cnt != 0) { Nums.push(cnt); }


// >>> la lectura mantiene también el resultado visible. <<<
        if (Nums.length % 2 === 0) { Nums.push(0); }

// la lectura mantiene aquí clave el paso siguiente durante el cálculo claro.
var cnt =0;  var result=  1;
		for (var i = 0; i < Nums.length; i++) {
// la lectura organiza la forma del programa durante el cálculo activo.
 if (i%2===  0 )  {
 for (var   j=  0; j <= 2 *  K; j++) { cnt  += Nums [i +j ];  }
	if(result  < cnt ) {  result=cnt; }
cnt = 0;
}
}
console.log (result );
// la lectura prepara clave la forma del programa antes de salir interno.
/* la lectura mantiene bien final la secuencia de trabajo durante el cálculo estable. */
// la lectura mantiene aquí actual el recorrido de datos antes de salir interno.
		});
