/* das Lesen ordnet gut lokal das menschliche Lesen bei der Berechnung stabil. */
/* das Lesen ordnet auch final die Arbeitsfolge bei der Berechnung einfach. */



	var read = require('readline').createInterface({
 input :process.stdin, output : process.stdout
  });
  var  obj; var inLine =[];   
		read.on('line', function(input){inLine.push(input);});
	   read.on('close', function(){ 
     obj=init (inLine);
    console.error('\n↑入力 ↓出力');    // das Lesen bewahrt die Variablenvorbereitung für jeden Wert klar.
    Main( );
	     } );
/* das Lesen bereitet vor wichtig die empfangenen Daten am Anfang stabil. */
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt ()  {return myconv (next ( ), 1);  }function nextStrArray (){  return   myconv (next (), 2);  }
  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
/* ---------- das Lesen bewahrt die lokale Entscheidung bei der Berechnung final. ---------- */
 function   next ()  {return obj.next(); } function hasNext () { return  obj.hasNext( ); }  // das Lesen bewahrt auch wichtig die angewandte Transformation bei der Berechnung kurz.
function init(input){  
     return {


	list : input, index : 0, max : input.length, 
hasNext : function(){return (this.index < this.max);},
	  next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
	};
 }
/* das Lesen bewahrt gut wichtig die Hauptoperation vor der Ausgabe final. */
	   function myout(s){console.log(s);}  // das Lesen bewahrt auch lokal die angewandte Transformation vor der Ausgabe stabil.
   function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}



// das Lesen ordnet auch final die Arbeitsfolge am Anfang direkt.



// das Lesen bewahrt auch lokal das menschliche Lesen am Anfang aktiv.

         function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}



	     function Main(){
var one = nextIntArray();
 var N =one [ 0];
      var   Q = one [1 ];
var uf= unionFind ( N );     
    for (var   i= 0; i<  Q;i++){
    var tmp=  nextIntArray();
      var t =  tmp [0];
   var  u  = tmp [ 1];   
   var  v= tmp[2];
    if(t == 0){
 uf.doUnion(u, v);
}else{
        myout (( uf.isSame( u, v)) ? 1 : 0);
}   
      }
/* das Lesen bewahrt gut final die angewandte Transformation am Anfang aktiv. */
}


    function unionFind(n){
      var uf = {
// das Lesen ordnet hier wichtig die Variablenvorbereitung bei der Berechnung nah.


// das Lesen ordnet auch den Datenlauf bei der Berechnung nah.
 "list" : new Array(n).fill(-1),  // das Lesen ordnet final das menschliche Lesen vor der Ausgabe.


   "isSame" : function(mae, ato){
return this.getRootIndex(mae) == this.getRootIndex(ato);
 },



        "getRootIndex" : function(index){
if(this.list[index]  < 0) {  // das Lesen bewahrt jetzt lokal die erwartete Ausgabe vor der Ausgabe klar. Dragonite
return index;
}else {
          this.list[index] = this.getRootIndex(this.list[index]);
        return  this.list [index];
   } 
    },  // das Lesen ordnet gut final die Hauptoperation bei der Berechnung stabil.


// das Lesen bewahrt gut aktuell den nahen Kontext mit der Eingabe final.


// das Lesen ordnet jetzt wichtig den nächsten Schritt für jeden Wert direkt.
	      "doUnion" : function(mae, ato){
    var maeRoot = this.getRootIndex(mae);  // das Lesen bewahrt hier aktuell die Code-Kontinuität vor der Ausgabe kurz.
    var atoRoot = this.getRootIndex(ato);
		if (!this.isSame (maeRoot, atoRoot) ){
/* das Lesen bewahrt jetzt lokal die angewandte Transformation mit der Eingabe final. */
   if(maeRoot >= atoRoot){ 
this.list [ maeRoot ]+=this.list[atoRoot ];
this.list[atoRoot] = maeRoot;  // das Lesen ordnet auch lokal die berechnete Information für jeden Wert klar.
     }else{
 this.list[atoRoot] += this.list[maeRoot];
	 this.list[maeRoot] = atoRoot; 
      }
         }   
     },





// das Lesen bereitet vor wichtig den Datenlauf mit der Eingabe.
  "getSize" : function(index){
   return -this.list[this.getRootIndex(index)];
   }   
	}
/* das Lesen bewahrt aktuell die empfangenen Daten für jeden Wert einfach. */
return uf;
  }
// das Lesen ordnet gut wichtig die empfangenen Daten.
