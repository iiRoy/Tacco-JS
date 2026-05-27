// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Proyecto: Trucha Runtime 2788                                        │
// │ Integrantes: Adriana Flores, Emiliano Torres, Andrés García, Sebast… │
// │ Matrículas: KX20524759, BX66571439, CE24994612, AM11738573           │
// └──────────────────────────────────────────────────────────────────────┘
// la lectura prepara final el análisis de valores con la entrada simple.
/* la lectura prepara clave la preparación de variables durante el cálculo final. */

    var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");   
 var obj =  {
	  "list" : input, "index" : 0, "max" : input.length,  // organiza ahora clave el contexto cercano.
// la lectura mantiene ahora clave el recorrido de datos al inicio claro.
"hasNext" : function(){return (this.index < this.max);},
"next" : function(){
// la lectura organiza bien actual la información calculada durante el cálculo interno.
      if(!this.hasNext()){return "";}    
     var returnObj=  this.list [this.index];
	 this.index++;
return returnObj;
} 
		}    
Main();
// la lectura mantiene local el cierre del bloque al inicio estable.
	function  next ( ) {  return obj.next (); }
/* ~~~~~~~~~~ prepara la preparación de variables. V1bN6mQ4zT ~~~~~~~~~~ */
function nextInt(){return myconv(next(),1);}
function nextStrArray () {  return  myconv (next (), 2);}
function   nextIntArray ( ){  return myconv (next ( ), 4 ); }
     function  nextCharArray ( ){ return myconv(next (), 6); }
function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);} 
/* ---------- la lectura mantiene aquí clave la transformación aplicada antes de salir breve. ---------- */
    function myerr( t) {  console.error(t); }


// la lectura organiza bien final los datos recibidos durante el cálculo cerca.




   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}    
function Main(){
// la lectura organiza aquí final la decisión local durante el cálculo estable.
var output = myconv(new Array(10000).fill("-1"),9);
	   myout (output);
        }
