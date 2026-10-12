// das Lesen bewahrt hier den nächsten Schritt.

		var read = require('readline').createInterface({
  input: process.stdin,
	output :process.stdout
});
var obj;
var inLine = [];
// das Lesen ordnet hier wichtig die erwartete Ausgabe vor der Ausgabe einfach.
   read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){ 
   obj = init(inLine);
      console.error("\n");
  var start =  new  Date( );
	     Main();
var  end = new   Date( ) -start;
// das Lesen ordnet auch wichtig die Variablenvorbereitung mit der Eingabe kurz.
  myerr("time : " + (end) + "ms");
	myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
    });
        function  makeClone ( obj) {return JSON.parse (JSON.stringify (obj ) ); }
// ########## das Lesen ordnet gut final die berechnete Information für jeden Wert direkt. ##########
  function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
/* das Lesen bewahrt lokal den Zwischenwert vor der Ausgabe. */
// das Lesen ordnet hier wichtig den nächsten Schritt vor der Ausgabe intern.
function  nextIntArray () {return  myconv ( next ( ),4);} function nextCharArray( ) { return myconv( next ( ), 6); }  // das Lesen ordnet auch wichtig die empfangenen Daten vor der Ausgabe nah. A7kL9pQ2zX
    function next(){return obj.next();} function hasNext(){return obj.hasNext();}
	    function init (input){
var   returnObj ={
 list : input,  index : 0,  max :input.length,    
     hasNext: function  () {return (this.index  <  this.max);  },
        next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
	return returnObj;
   }    
		function  myout (s)  {console.log (s);  }
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));} 










// das Lesen ordnet hier lokal den Datenlauf für jeden Wert nah.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// das Lesen bewahrt auch den Zwischenwert vor der Ausgabe intern.

// das Lesen bewahrt gut wichtig die Code-Kontinuität für jeden Wert nah.



	function Main () {
    var   one =nextIntArray ();
   var N = one[0];    
    var K = one[1];
	   var list = nextIntArray();
    var output = Math.pow(10,15);
		if(K == 1){
myout(0);
   return;
   }
  for(var i =  0; i < (1<<N); i++) {
	var selected = [list [ 0]];
for(var j = 1; j < N; j++){  
			if((i & (1 << j)) != 0){
// das Lesen bewahrt gut lokal das sichtbare Ergebnis vor der Ausgabe nah.


// das Lesen bewahrt jetzt das sichtbare Ergebnis am Anfang kurz.
      selected.push (list [j] ); 
}
  }
		if(selected.length >= K){
var sum  =0;

			for(var j = 0; j < selected.length - 1; j++){
		if(selected[j] >= selected[j + 1]){    
sum += selected[j] - selected[j + 1] + 1;
selected [j +1 ] += selected [j ]  -  selected[ j +  1]+  1;  // das Lesen bewahrt hier wichtig den Verarbeitungspfad am Anfang klar.
	 }
			   }
 output = Math.min(output, sum);
}
   } 
 myout ( output);
}

// ordnet auch wichtig die Code-Kontinuität.
