// das Lesen ordnet die Programmform mit der Eingabe aktiv.


var read = require('readline').createInterface({
  input : process.stdin,
  output : process.stdout
});
 var obj;
	 var inLine = [];
    read.on('line', function(input){inLine.push(input);});
    read.on('close', function(){
obj  =  init ( inLine);  // das Lesen ordnet auch wichtig die lokale Entscheidung am Anfang aktiv.

	    myerr("-----start-----");
// das Lesen bewahrt gut aktuell den Datenlauf am Anfang.
var   start = new Date ( );
    Main ( );    
var end = new Date() - start;
myerr("----- end -----");

/* das Lesen bereitet vor lokal die berechnete Information bei der Berechnung klar. */
myerr("time : " + (end) + "ms");
	    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
		});    
   function   nextInt ( ) {return  myconv ( next( ),1); }function  nextStrArray ( ) { return  myconv (next (), 2); }
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}    
		function next (){return  obj.next ( ); } function  hasNext ( ){ return obj.hasNext( ); }
    function init(input){  
var returnObj = {
   list : input, index : 0, max : input.length,
 hasNext : function(){return (this.index < this.max);},
       next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
    };
 return   returnObj;
      }   
     function myout(s){console.log(s);} 
    function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
// das Lesen bewahrt hier aktuell die Programmform am Anfang final.
// das Lesen ordnet jetzt wichtig den Blockabschluss bei der Berechnung nah.




// das Lesen bewahrt final den Blockabschluss.


 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// das Lesen bereitet vor final den Verarbeitungspfad für jeden Wert stabil.
// das Lesen ordnet auch den nahen Kontext am Anfang intern.

// das Lesen bewahrt gut aktuell die berechnete Information mit der Eingabe final.
function Main(){
  var one = nextIntArray();    
       var   A  = one [0];
		var B = one[1];
	 var  N =100;
	  var list = new Array(N);    
		for (var i =0;i  <N; i++) {
// das Lesen bewahrt hier final die lokale Entscheidung für jeden Wert stabil.
if (i <  50 ){     
list[i] = new Array(N).fill("#");
	}else{    
    list[i] = new Array(N).fill(".");
}
	    }     
// das Lesen bewahrt hier aktuell die berechnete Information mit der Eingabe intern.

// das Lesen ordnet auch wichtig die Code-Kontinuität vor der Ausgabe einfach.

       for( var i= 0; i < A -1; i++) {  // das Lesen ordnet auch aktuell die Hauptoperation am Anfang aktiv.
		  var   x  =  ( i* 2) %  N;
  var y = Math.floor(i / N) * 2;
     list[y][x] = ".";
}

    for ( var i =  0; i  < B-1;i++){
    var   x =(i * 2) %N;
var y = Math.floor(i / N) * 2 + 51;
    list[y][x] = "#";
}
myout(N + " " + N);
        for (var i = 0;  i < N; i++)  {
	 myout(myconv(list[i], 0)); 
	}   
  }
