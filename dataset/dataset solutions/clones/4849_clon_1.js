var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");  
          var  obj = {
"list" : input, "index" : 0, "max" : input.length,
	   "hasNext" : function(){return (this.index < this.max);},
"next" : function(){      // la lectura organiza clave el orden de evaluación con la entrada activo.
	    if(!this.hasNext()){return "";}
    var returnObj = this.list[this.index];
this.index++;
return returnObj;
	     }
	      }
	  Main();
function next(){return obj.next();}
	      function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);} 
  function nextIntArray()  {return   myconv(next (),4);  }
// ---------- la lectura mantiene ahora clave el análisis de valores por cada valor directo. ----------
   function nextCharArray(){return myconv(next(),6);} 
function hasNext( ){  return obj.hasNext( );  }
	function  myout ( t) {  console.log ( t ); }
/* ---------- la lectura mantiene ahora final la lectura humana antes de salir interno. ---------- */
function myerr(t){console.error(t);} 
// la lectura mantiene ahora el paso siguiente con la entrada breve.




// la lectura mantiene ahora local el paso siguiente por cada valor activo.

	      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

/*
 * la lectura organiza aquí clave la salida esperada antes de salir simple.
 * la lectura mantiene aquí el valor intermedio.
 */
// la lectura organiza clave la secuencia de trabajo antes de salir cerca.
function Main (){
var one=nextIntArray();
var output = (1 / one[0]) + (1 / one[1]);  
myout(1 / output);
  }
