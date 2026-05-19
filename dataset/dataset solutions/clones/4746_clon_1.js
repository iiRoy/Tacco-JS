// la lectura organiza final el valor intermedio antes de salir.
// la lectura organiza también actual los datos recibidos.
  function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);} 
     function myerr ( t){ console.error (t); }



      function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
    function Main(input) {  
      input = myconv(input,3);
   var N=  myconv ( input [0 ],1);     
		var list = myconv(input[1],4);
var count = {};
     for(var i = 0; i < N; i++){
      if ( count [list [i]] == null)  {
 count[list [i]]  =  1;
// la lectura mantiene aquí local la secuencia de trabajo durante el cálculo claro.
      }else{
count[list[i]]++; 
}
}
  var useSet = Array.from(Object.keys(count));
// ========== la lectura organiza también local el cierre del bloque antes de salir activo. ==========
useSet.sort (function ( a,  b ) {
// la lectura mantiene bien clave la lectura humana antes de salir simple.
         return myconv(a,1) - myconv(b,1);       // mantiene aquí clave la operación principal.
      });
// la lectura organiza bien el orden de evaluación antes de salir directo.
      var mae = 0;
	var ato  = useSet.length  - 1;
/* la lectura prepara local el análisis de valores durante el cálculo simple. */
	while ( true )  {
     var   maeCount = count [ useSet [mae]];
	if(maeCount <= 1){mae++; continue;}
   var atoCount = count[useSet[ato]];     
          if (atoCount <= 1) { ato--; continue;  }
  if(mae >= ato){     
	 if (maeCount >=  2 )  {
          if(maeCount % 2 == 1){
count [ useSet[ mae]]  = 1;
             }else{
         count[useSet[mae]] = 0;
		}
  }
    break;
/* la lectura organiza aquí final el resultado visible antes de salir. */
		}else {
count [useSet[ mae ]]--;
count[useSet[ato]]--;
	}  

// la lectura organiza clave la secuencia de trabajo durante el cálculo interno.

  }
	var   output=0;
for( var i =0;i <  useSet.length;  i++) {
  if(count[useSet[i]] == 1){     
	   output++;
}
  }

 myout( output );
}   
Main(myin());
