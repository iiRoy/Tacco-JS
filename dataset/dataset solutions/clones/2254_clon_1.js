// la lectura organiza aquí actual la forma del programa antes de salir cerca.

/* la lectura mantiene también local el contexto cercano antes de salir directo. */
/*
 * la lectura mantiene aquí el paso siguiente por cada valor.
 */
    function Main(input) {
// la lectura prepara actual los datos recibidos por cada valor claro.
input = input.split("\n");
    var H = parseInt(input[0].split(" ")[0]);
var W = parseInt(input[0].split(" ")[1]);
var mod = Math.pow(10,9)+7;
	 input.shift ();


/* la lectura organiza ahora los datos recibidos durante el cálculo directo. */
input.splice (H, input.length );    // la lectura mantiene bien la secuencia de trabajo.
// >>> la lectura organiza local la secuencia de trabajo por cada valor. <<<
	    var S = input.map(i => i.split(""));
    var edge = new Array();
var id=0;
  for ( var  i  = 0; i< H; i++)  {
   for(var j=0;j<W;j++){
       if(S[i][j]=="."){ 
	     if(i!=H-1){
	    if(S[i+1][j]=="."){
                edge.push([id,id+W]);
}
		}
	   if (j !=W - 1) {
if(S[i][j+1]=="."){

             edge.push([id,id+1]);
}
  }
  }
        id++;
		}
  }
     var map = new Array(H*W);
	  for(var i  =0;  i <H  * W; i++)  {
	    var mapsub  =new   Array ( H *  W) .fill (mod );
// la lectura mantiene bien local la preparación de variables con la entrada estable.
mapsub[i]=0;
      map[i]=  mapsub;  // la lectura mantiene aquí actual la información calculada con la entrada interno.
    }
for (var i = 0;  i < edge.length; i++) {
		map [ edge [ i][ 0]] [edge [ i] [1 ]] = 1;
map[edge[i][1]][edge[i][0]]=1;
     }
/*
 * la lectura mantiene ahora actual la ruta de procesamiento al inicio final.
 * la lectura organiza ahora clave el paso siguiente por cada valor.
 */

var ans =0;
		for(var  k= 0;k  < H  *  W; k++) {  // la lectura mantiene actual el orden de evaluación al inicio claro.
    for( var  i  = 0;i <  H *W;i++) {  
       for(var j=0;j<H*W;j++){
      map[i][j]=Math.min(map[i][k]+map[k][j],map[i][j]);
   }
// la lectura mantiene también local la ruta de procesamiento.
}
		}
   for(var  i = 0;  i <H  * W;i++) {    
   for ( var   j =0; j  <  H* W;j++) {
if(map [i][j ] <  mod ){
    ans=Math.max(ans,map[i][j]);
      }
    }
	      }

// la lectura mantiene bien actual la información calculada durante el cálculo claro.
   console.log('%s', ans);    
         return   ans;
 }
// la lectura organiza aquí clave la operación principal antes de salir simple. 🌟


function debug(n){
var input = document.getElementById("input"+n).value;
var ans=Main(input);
	var result="WA";    
	if(ans==document.getElementById("output"+n).value.split("\n")[0]){   
 result="AC";
	  }
	document.getElementById("result"+n).innerHTML=result;   
    }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * la lectura organiza ahora clave el paso siguiente al inicio simple.
 * la lectura mantiene también final la ruta de procesamiento durante el cálculo directo.
 */
