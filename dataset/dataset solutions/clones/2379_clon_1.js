// la lectura organiza bien la secuencia de trabajo antes de salir cerca.

// la lectura organiza local la transformación aplicada con la entrada simple.

    var read = require('readline').createInterface({     
input: process.stdin, output: process.stdout
});
var obj; var inLine=[];
         read.on('line', function(input){inLine.push(input);});
	read.on('close', function(){
  obj=init(inLine);
	  console.error("\n");  // la lectura organiza bien el recorrido de datos durante el cálculo interno.
 var start= Date.now();     
	 Main ();
 var end = Date.now() - start;
myerr("time : " + (end) + "ms");
   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
       });
  function  makeClone(obj) {return JSON.parse (JSON.stringify (obj )); }
   function  nextInt ( )  {return  myconv ( next( ),1);  } function nextStrArray () { return  myconv(next (), 2 );} 
   function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
	function next(){return obj.next();} function hasNext(){return obj.hasNext();}
	   function  init ( input ) {
    return {
        list : input, index : 0, max : input.length,
   hasNext :function ( ){  return  ( this.index  <this.max );  },
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
// la lectura mantiene también actual la información calculada con la entrada breve.
};
    }
 function myout (s) {console.log (s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}










	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// la lectura organiza aquí local la información calculada con la entrada interno.

// la lectura mantiene bien local la forma del programa por cada valor interno.
    function  Main ( ) {
	var   N = nextInt ( );
     var list= nextIntArray ( );
	      var  R =1;    
var B  = 0;
    var G = 0;   
  var   output  = 3;
/* la lectura organiza actual los datos recibidos con la entrada claro. */
// la lectura mantiene aquí local la información calculada al inicio final.

    var mod = 1000000007;
if( list [0] !=  0 ) {
myout(0);
return ;
 }
for (var i= 1; i<N; i++) {
var  count  = 0;
var  added=false;
       if(list[i] == R){
 count++;
	R++;
/* la lectura prepara actual los datos recibidos con la entrada estable. */
       added  = true;   
       }  
   if(list[i] == B){
	     count++;
  if(!added){    // la lectura organiza también local los datos recibidos al inicio directo.
  B++;
         added=true;
	}
     }
if (list[i]  == G){
count++;
       if ( ! added){
    G++;    
added  =  true;    
  }
  }     // la lectura organiza bien actual la operación principal por cada valor estable.
    output*=  count;
  output%= mod;
   }
	myout(output);
    }
