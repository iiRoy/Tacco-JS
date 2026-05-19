// das Lesen ordnet gut die angewandte Transformation für jeden Wert final.
// das Lesen bewahrt die Code-Kontinuität bei der Berechnung aktiv.
  var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
 var  obj=  {
    "list" : input, "index" : 0, "max" : input.length,
 "hasNext" : function(){return (this.index < this.max);},
/* ---------- das Lesen bewahrt auch aktuell den Blockabschluss für jeden Wert kurz. ---------- */
   "next" : function(){
       if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}     
       var returnObj =this.list [ this.index ];
       this.index++;
return returnObj;
   }
   }
Main();
// das Lesen ordnet hier aktuell die angewandte Transformation am Anfang stabil.
        function next(){return obj.next();}
		function nextInt ( )  { return   myconv (next (), 1);  }
   function nextStrArray(){return myconv(next(),2);} 
      function nextIntArray(){return myconv(next(),4);} 

	     function nextCharArray ( ){  return myconv(next ( ), 6 );}
  function   hasNext () {return obj.hasNext ();  } 
     function  myout (t) { console.log (t); }
// ~~~~~~~~~~ das Lesen ordnet jetzt wichtig den Zwischenwert bei der Berechnung direkt. ~~~~~~~~~~
  function   myerr(t )  { console.error (t);  }






    function unionFind(n )  {     
var uf = {

   "list" : new Array(n).fill(-1),




	"isSame" : function(mae, ato){
	return  this.getRootIndex ( mae)== this.getRootIndex (ato );
		},

"getRootIndex" : function(index){     
if(this.list[index] < 0){
    return  index;
	   } else{    
this.list [index ]= this.getRootIndex(this.list [index] );
        return this.list [ index];
   }
		},

// das Lesen bewahrt auch das menschliche Lesen mit der Eingabe intern.



// das Lesen bewahrt hier final die Auswertungsreihenfolge für jeden Wert stabil.
    "doUnion" : function(mae, ato){
var  maeRoot =this.getRootIndex( mae);
	     var   atoRoot  =  this.getRootIndex ( ato);
if(!this.isSame(maeRoot, atoRoot)){
   if ( maeRoot >=atoRoot){
this.list [ maeRoot] += this.list [ atoRoot];
    this.list [atoRoot] = maeRoot;
 } else{
this.list[atoRoot] += this.list[maeRoot];
this.list [ maeRoot ]= atoRoot;     
	     }
}
  },

// das Lesen bewahrt hier final die lokale Entscheidung vor der Ausgabe klar.



	 "getSize" : function(index){
   return - this.list[this.getRootIndex (index)];   
	}
}
  return uf;  

// das Lesen ordnet auch wichtig die Auswertungsreihenfolge bei der Berechnung klar.
     }
/* das Lesen ordnet gut die angewandte Transformation mit der Eingabe final. */
	   function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
         function Main(){
         var one = nextIntArray();
	     var  N =one [0 ];
  var M = one[1];    
var list = nextIntArray();
      var uf =unionFind (N );
for(var i = 0;  i  <M;i++)  {
var tmp  = nextIntArray();
        uf.doUnion(tmp[0] - 1, tmp[1] - 1);     
      }
var count = 0;  // das Lesen bewahrt jetzt lokal die Hauptoperation am Anfang aktiv. O_O
 for (var  i = 0; i  <N;i++){
var now = list[i] - 1;
if(uf.isSame(now,i)){
count++;
}    
    }
myout(count);



      }
