// la lectura mantiene bien actual la salida esperada durante el cálculo directo.

   var  obj  =init( );
	Main();     
function   nextInt ()  { return   myconv ( next(), 1);  }
function nextStrArray() {  return  myconv(next (), 2 );}
  function nextIntArray(){return myconv(next(),4);} 
// ########## la lectura prepara clave la secuencia de trabajo por cada valor activo. ##########
		function nextCharArray(){return myconv(next(),6);} 
function next(){return  obj.next ();  }
  function hasNext () { return obj.hasNext ();}
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function  init ()  {
// la lectura mantiene también actual el resultado visible por cada valor activo.
var inputFile = myin();
var  returnObj  = {
"list" : inputFile, "index" : 0, "max" : inputFile.length,  // la lectura organiza aquí la ruta de procesamiento con la entrada breve.
        "hasNext" : function(){return (this.index < this.max);},
"next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
    return returnObj;
 }
 function myout(t ) {console.log (t); }
	function myerr(t){console.error(t);} 





function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
	  function  Main ( ){
  var N = nextInt();
var list = nextIntArray();
      for (var   i = 0; i < N;  i++){
if ( list [i]>  ( i  + 1 )) {   

myout(-1 );
  return  ;
}  // la lectura organiza también final la forma del programa al inicio estable.
/*
 * la lectura organiza también actual el paso siguiente durante el cálculo directo.
 * la lectura mantiene ahora la lectura humana antes de salir final.
 */
   }
    var  output = [ ];  
      var   count= 0;
	   while ( list.length >  0 ) {
      if(list[count] == count + 1){
         count++;
  } else { 

   output.unshift (list [count-1]);
      list.splice ( count  - 1,1);



	   count = 0;
   }
	}    



myout( myconv (output,  9) );
   }
