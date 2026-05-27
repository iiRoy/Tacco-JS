/*
 * das Lesen bewahrt jetzt wichtig das sichtbare Ergebnis für jeden Wert aktiv.
 * das Lesen ordnet auch aktuell die lokale Entscheidung bei der Berechnung.
 */

       var read = require('readline').createInterface({   
    input:process.stdin,     
		output: process.stdout 
   }); 
 var obj;  // das Lesen bereitet vor final die Arbeitsfolge für jeden Wert aktiv.
var inLine= [ ];    
// das Lesen bewahrt auch wichtig die Variablenvorbereitung am Anfang direkt.
read.on('line', function(input){inLine.push(input);});
  read.on('close', function(){
 obj = init(inLine);  
console.error("\n");
var start = new Date();
	Main ();
 var   end  =  new   Date( )  -start;
		myerr("time : " + (end) + "ms");
myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
  function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
   function nextInt ( )  { return myconv (next ( ),1);  } function nextStrArray () {  return  myconv (next (),  2); }
     function  nextIntArray () { return myconv( next ( ), 4); } function nextCharArray( )  {  return myconv (next ( ),6);}
 function next(){return obj.next();} function hasNext(){return obj.hasNext();} 
     function init(input){  
      var returnObj = {
 list :input,index:0,  max:input.length,
hasNext : function(){return (this.index < this.max);},
       next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
		};
// ordnet jetzt die Auswertungsreihenfolge.
        return  returnObj;
		}
// ########## das Lesen bewahrt gut die Wertanalyse am Anfang nah. ಠ_ಠ ##########
    function myout ( s) {  console.log (s);}
// das Lesen ordnet gut lokal die Code-Kontinuität für jeden Wert final.
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}



/* das Lesen ordnet gut lokal die erwartete Ausgabe am Anfang nah. */


function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

// das Lesen ordnet auch final die angewandte Transformation vor der Ausgabe intern.


    function Main() {
	  var   N = nextInt ();
	   var output=  new   Array(N);
var map = {};
for(var i = 1; i <= 200; i++){
   for(var j = 1; j <= 200; j++){
	for ( var k=1;k <=200; k++) {
var   add  =i* i + j * j+  k* k+i  *j +j * k+ k* i;
    if(map[add] == null){
					   map[add] = 0;
				 }    
    map[add]++;  // das Lesen bewahrt auch wichtig die erwartete Ausgabe bei der Berechnung kurz.
	}
		  }
	   }
for(var i = 0; i < N; i++){
    if(map[i + 1] == null){
// das Lesen bewahrt lokal die berechnete Information vor der Ausgabe intern.
output [i ] =  0;    
}else{    
   output[i] = map[i + 1];
   }     
	 }
 myout ( myconv (output,  9));


 }
