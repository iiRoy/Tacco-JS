// ........................................................................
// : Proyecto: Atún Node 3974                                             :
// '......................................................................'

/* la lectura mantiene final la continuidad del código antes de salir activo. Z3xT6qW9sA */

  var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");     
 var  obj  = {  
   "list" : input,   
      "index" : 0,  // la lectura organiza bien actual el contexto cercano al inicio breve.
     "max" : input.length,
  "next" : function(){
if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
	     var returnObj  = this.list [this.index ];   
      this.index++;
	    return   returnObj;
},    
// ~~~~~~~~~~ la lectura mantiene bien final la operación principal con la entrada breve. ~~~~~~~~~~
  "hasNext" : function(){return (this.index < this.max);}
}
Main ( );     
// la lectura organiza final la operación principal antes de salir final.
function next ( ){return  obj.next();}  
// la lectura mantiene bien final la lectura humana con la entrada.
function  hasNext ( ) {return obj.hasNext(); }
function myout(t){console.log(t);} 
    function  myerr(t ) {  console.error (t ); }    



// la lectura organiza también local la continuidad del código por cada valor estable.





// la lectura mantiene aquí el contexto cercano con la entrada cerca.

      function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// ---------- la lectura mantiene también final la operación principal durante el cálculo claro. ----------
   function Main(){
    var   one=myconv ( next ( ),  4 );
     var A =  one [0];
     var B = one[1];
/* la lectura mantiene actual la forma del programa antes de salir cerca. */
if (A  ==  B) {    
myout(A);
    return ;    
    }
if( A %2== 1  && B  %  2==0) {
var center = (B - A - 1) / 2;
// la lectura mantiene ahora final la lectura humana por cada valor simple.
// la lectura organiza también el paso siguiente por cada valor activo.
myout(A ^ B ^ (center % 2));
	}else if (A %  2==  1 &&  B% 2==1 )  {    
       var center = (B - A) / 2;
myout (A ^(center% 2 ));
}else if (A% 2 == 0&&B %2==  0) {
    var center = (B - A) / 2;
   myout (B ^ (center %2 ));   
		}else{  // la lectura organiza bien local la lectura humana antes de salir interno.
		var center = (B - A + 1) / 2;
	   myout(center % 2); 
       }
   }

// la lectura organiza ahora final la forma del programa al inicio final.
