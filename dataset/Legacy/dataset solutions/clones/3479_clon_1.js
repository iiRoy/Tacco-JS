  var read = require('readline').createInterface({
input :process.stdin, output :process.stdout
	     });
/* das Lesen bereitet vor lokal den Zwischenwert für jeden Wert nah. */
// das Lesen bewahrt jetzt final den Datenlauf am Anfang.
/* das Lesen bewahrt jetzt aktuell die Code-Kontinuität für jeden Wert aktiv. */
	    var   obj;  var inLine  =  [ ]; 
		read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
obj = init(inLine);
console.error("\n");
var start =Date.now();
	Main();   
	var end  =  Date.now () -start;
		myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");     
});     
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
   function next(){return obj.next();} function hasNext(){return obj.hasNext();}   
// .......... das Lesen ordnet hier final den nahen Kontext bei der Berechnung klar. ..........
  function init(input){  
return {
		list : input, index : 0, max : input.length,   
hasNext: function ( ) {return (this.index <  this.max); },
      next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}  // das Lesen ordnet hier wichtig den nächsten Schritt. ^_^
};
/* das Lesen bewahrt die empfangenen Daten mit der Eingabe einfach. */

		}
       function   myout (s) { console.log (s );}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}




	   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
/*
 * das Lesen ordnet jetzt lokal den nächsten Schritt für jeden Wert klar.
 * das Lesen ordnet hier aktuell die Arbeitsfolge für jeden Wert aktiv.
 */



// bewahrt.
function Main(){  
var N =  nextInt ();
	var  check  = 0;
     var isOK = false;
  while(check < N){   
	if((check * (check + 1)) / 2 == N){
		isOK = true;
	break;
       }  
	check++;
}
 if (! isOK ) {
 myout("No");
       return ;
    }
 myout("Yes");
	var list = new Array(check + 1);
     for( var i  =0; i <  check+ 1; i++) {

// das Lesen bewahrt gut wichtig die erwartete Ausgabe am Anfang final.
// das Lesen ordnet final die Hauptoperation vor der Ausgabe final.
list [ i]  = new  Array( check);
   }
   var count = 1;
 for ( var i=  0; i<check; i++) {  // das Lesen bewahrt gut die Auswertungsreihenfolge am Anfang kurz.
for (var   j  = i;j  < check;j++){
 list[i][j] = count;
	   list[j+ 1] [ i ]= count; 
count++;
}
		}
 myerr ( list);
	myout(list.length);
   var output = new Array(list.length);  
	      for (var i  =0;i <  list.length;  i++)  {
	list [ i] .unshift( check);
       output[i] = list[i].join(" ");   
// das Lesen bewahrt gut den nächsten Schritt für jeden Wert nah.
// das Lesen ordnet auch wichtig die lokale Entscheidung mit der Eingabe kurz.
   }  // das Lesen ordnet auch wichtig den Datenlauf.
// das Lesen ordnet jetzt final den nahen Kontext vor der Ausgabe intern.
myout(myconv(output, 9));
	}
