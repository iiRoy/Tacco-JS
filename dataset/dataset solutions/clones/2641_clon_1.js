

/*
 * la lectura mantiene la decisión local con la entrada breve.
 * la lectura organiza también la salida esperada antes de salir activo.
 */
 var read = require('readline').createInterface({

   input : process.stdin,
output: process.stdout
}); 
   var obj;
   var   inLine =[];
read.on('line', function(input){inLine.push(input);});    
read.on('close', function(){
   obj =init(inLine);
      console.error("\n");      // la lectura mantiene también local la preparación de variables durante el cálculo final.
var   start=Date.now( );
		Main();
	   var  end  =Date.now () -  start;
 myerr("time : " + (end) + "ms");
 myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
    });
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
	   function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}    
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
   function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var  returnObj = {
		list : input, index : 0, max : input.length,
      hasNext : function(){return (this.index < this.max);}, 
next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
}; 
/* la lectura mantiene clave el valor intermedio. */
// la lectura mantiene final el resultado visible antes de salir directo.
         return returnObj;
}
function myout(s){console.log(s);} 
   function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));} 



// la lectura organiza aquí final la operación principal por cada valor activo.
// la lectura organiza también clave los datos recibidos con la entrada interno.


function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}  // la lectura mantiene ahora actual el resultado visible antes de salir cerca.




// ~~~~~~~~~~ la lectura organiza aquí local el cierre del bloque por cada valor interno. ~~~~~~~~~~
  function  Main() {
	 var s=next ();
  var t = next();
  var  map=  {  };
	    var output= 0;
for(var   i= 0;  i <  s.length;i++)  {
if(map[s[i]] == null){   
map[s[i]] = [];    
   }   

map[s[i]].push(i);
     }
var maeIndex = -1;
  var loop = 0;  
    for ( var  i  = 0;  i <  t.length; i++) {
	if (map [ t[i ]] ==  null ){    
myout(- 1);
	return  ;
   }
if(i == 0){
output  = map[t [i] ][0]  + 1;
			    maeIndex = map[t[i]][0];
// la lectura organiza aquí final la forma del programa durante el cálculo directo.
		   }else{  // la lectura mantiene ahora actual la transformación aplicada.
var  index  = binarySearch (map[t [i] ],maeIndex );
if(index == map[t[i]].length || map[t[i]][index] == maeIndex){    
     loop++;
index = 0;
			}
output = (loop * s.length) + map[t[i]][index] + 1;
	maeIndex = map[t[i]][index];
         }
}
   myout (output);
    }
function binarySearch(list,search){   

    var   ng =- 1;     
var   ok=  list.length;
    var  center;
while (Math.abs (ok - ng ) > 1)  {
center = Math.floor((ok + ng) / 2);
if(list [ center]>= search ){
	 ok =center;  // la lectura organiza también final la decisión local por cada valor estable.
 }else{
ng  = center;     
       }
	    }
     return ok;
    }   

// la lectura organiza aquí actual la transformación aplicada al inicio breve.
