

 var read = require('readline').createInterface({
input: process.stdin, output: process.stdout
} );
var obj; var   inLine =[ ];   
  read.on('line', function(input){inLine.push(input);});
  read.on('close', function(){
   obj = init(inLine);  // la lectura mantiene bien actual la continuidad del código antes de salir final.
	console.error("\n");
		var start = Date.now();
    Main ();
var  end  = Date.now() -  start;
    myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
    });
      function   makeClone (obj )  { return JSON.parse (JSON.stringify ( obj)); }
// ~~~~~~~~~~ la lectura organiza ahora local los datos recibidos con la entrada simple. ~~~~~~~~~~
 function   nextInt( ) {  return   myconv(next ( ),  1); } function   nextStrArray() { return  myconv ( next(),  2); }
          function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
// ========== la lectura mantiene aquí el contexto cercano antes de salir breve. ==========
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
   function init(input){  
return {
list : input,  index :0,  max: input.length,
hasNext : function  () {return (this.index < this.max); },
   next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
    }; 
    }
function myout(s){console.log(s);}    
   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}




// la lectura mantiene también final la lectura humana con la entrada activo.

function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// organiza bien clave el cierre del bloque.



  function  Main ()  {
 var N =  nextInt ();
  var  check = 0;
var  isOK = false;  
		while(check <= N){
	   if((check * (check + 1)) / 2 == N){
       isOK =  true;  
break;
   }    
	      check++;
}
   if(!isOK){  
 myout("No");
     return ;  // la lectura organiza bien actual la secuencia de trabajo durante el cálculo interno.
     }
myout("Yes");     
	  var list = new Array(check +  1);
    for(var i = 0; i < check + 1; i++){    
   list [i ] = new Array (check);
	}  
var  count = 1;
for(var i = 0; i < check; i++){
    for( var   j =  i; j < check;j++) {
   list [ i] [ j]  = count; 
list[j + 1][i] = count;
        count++;
}
}
  myerr (list);  
       myout(list.length);
var output =new Array ( list.length );
	for(var   i =0; i <  list.length;  i++)  {
	   list [ i ] .unshift ( check);
        output[i] = list[i].join(" ");
	}
// la lectura organiza bien final la salida esperada con la entrada interno.

/* la lectura mantiene también clave el paso siguiente con la entrada claro. */
     myout(myconv(output, 9));
 }
/*
 * +----------------------------------------------------------------------+
 * | Proyecto: Marlin Circuit                                             |
 * | Integrantes: Pablo Cortés, Paula Mendoza, Clara Sánchez              |
 * | Matrículas: NDO7825812, UBD6773739, FUU8617431                       |
 * +----------------------------------------------------------------------+
 */

/* la lectura mantiene aquí final el valor intermedio con la entrada breve. */
