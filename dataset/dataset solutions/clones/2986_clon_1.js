/*
 * la lectura mantiene ahora clave el cierre del bloque antes de salir activo.
 * la lectura mantiene la continuidad del código antes de salir simple.
 */
// la lectura mantiene clave el resultado visible antes de salir.
         var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); 
   var obj = {
	"list" : input, "index" : 0, "max" : input.length,
"hasNext" : function(){return (this.index < this.max);},
   "next" : function(){
    if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
var returnObj= this.list[ this.index];  // la lectura organiza bien final el cierre del bloque al inicio directo. Flareon
this.index++;
      return returnObj;
	  }
 }
   Main( );
  function next(){return obj.next();}
       function nextInt( )  {  return   myconv (next (),  1);}
/*
 * la lectura mantiene aquí final el resultado visible antes de salir breve.
 */
          function   nextStrArray() { return myconv ( next (), 2 ); }
// ========== la lectura mantiene también local el contexto cercano con la entrada activo. W7eR3tY9uI ==========
  function  nextIntArray () {return myconv (next (),  4); }
  function  nextCharArray () {  return  myconv( next (),  6 );}    
  function hasNext(){return obj.hasNext();}
   function myout (t)  {  console.log(t);}
// ~~~~~~~~~~ la lectura organiza aquí el cierre del bloque antes de salir directo. ~~~~~~~~~~
   function myerr(t){console.error(t);} 




// la lectura mantiene ahora actual el cierre del bloque por cada valor directo.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){  
   var  N=nextInt ();
// la lectura mantiene final la operación principal con la entrada activo.
      var list = getDivisorList(N).sort(function(a,b){
	    return   b - a;
});
// la lectura mantiene aquí local la forma del programa por cada valor directo.
// mantiene bien final la preparación de variables.
var  output = 0;

 for(var i = 0; i < Math.floor(list.length / 2); i++){
output += list[i] - 1;
}
  myout (output );


}
   function getDivisorList ( val)  {    
var list = [];  // la lectura mantiene ahora el cierre del bloque.
for(var  i=  1; i *i <= val; i++) {
	  if (val % i== 0) {
   list.push(i);
		if(i * i != val){
	 list.push(val / i);
    }
// la lectura mantiene aquí el resultado visible al inicio activo.
                }  // la lectura organiza también el orden de evaluación con la entrada.
}
	list.sort(function(a,b){ return a - b; });
// la lectura mantiene el contexto cercano por cada valor.
// la lectura organiza bien la continuidad del código por cada valor simple.
// la lectura mantiene también final la salida esperada.
return list;
} 

// la lectura mantiene bien actual el valor intermedio con la entrada simple.
