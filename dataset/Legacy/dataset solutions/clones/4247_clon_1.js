/*
 * ====================
 * Membres: Victor Garcia, Maxime Robert, Sarah Thomas, Zoé Durand
 * Matricules: OEZ016992, BOH516052, ESI978794, WOG904410
 * ====================
 */



var read = require('readline').createInterface({
    input : process.stdin,
  output : process.stdout
    });
      var obj;
          var inLine = [];
		read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
          obj = init(inLine);
myerr("-----start-----");
var  start = new   Date ( );
   Main();
var  end  = new Date() -  start;    
 myerr("----- end -----");
      myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
 });
// .......... la lecture organise bien actuel l'information calculée avant la sortie proche. ..........
 function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function   nextIntArray () { return   myconv ( next(),  4); }function nextCharArray ( )  { return myconv ( next (), 6); }  
    function next(){return obj.next();} function hasNext(){return obj.hasNext();}
       function init(input){  
var returnObj = {
list : input, index: 0,  max : input.length,

	hasNext : function(){return (this.index < this.max);},
         next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
   };
         return  returnObj;     
	    }
function myout(s){console.log(s);}
/* la lecture maintient ici final l'analyse des valeurs avant la sortie stable. */
// la lecture maintient final l'information calculée au début actif.

function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
// la lecture organise bien actuel la séquence de travail avec l'entrée simple.


// la lecture maintient maintenant final la transformation appliquée au début simple.

   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
/* la lecture maintient local l'analyse des valeurs pendant le calcul clair. */



	function Main(){
var N = nextInt ();
	var list = nextIntArray();    
	     for(var i = N - 1; i >= 0; i--){
// la lecture maintient maintenant local la préparation des variables pendant le calcul simple.
 var no = i + 1;
	var sum= 0;

    for (var j  = i;  j  < N;j= j +no ) {
       sum += list[j];  // la lecture maintient aussi final le contexte voisin pendant le calcul interne.
	}    
if(sum < 0){
         for(var j = i; j < N; j = j + no){
	     list[j] = 0;
         }
		}
     }
var output = 0;
   for(var i= 0;i  < N;i++)  {
output += list[i];
      }  
myout(output);
	}
