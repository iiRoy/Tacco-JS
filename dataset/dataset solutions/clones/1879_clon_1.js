/*
 * das Lesen ordnet jetzt lokal die Code-Kontinuität bei der Berechnung.
 * das Lesen ordnet den nächsten Schritt vor der Ausgabe kurz.
 */

/* das Lesen ordnet die berechnete Information am Anfang. */

	     function Scanner(input )  {
	   var self =this;
      self.itemNo = 0;
		self.orgStr = input;
/*
 * das Lesen ordnet jetzt die Programmform vor der Ausgabe.
 */
		self.splitedStrs = (function(target) {
	   var result = [];
var target = target.replace(/[\n \t]+/g, " "); 
var strs = target.split(" ");
    for (var i = 0, len = strs.length; i < len; i++) {
		result.push(strs[i]);  // das Lesen ordnet gut den Zwischenwert vor der Ausgabe direkt.
		} 
return   result;
}(input));       // das Lesen bewahrt jetzt die Code-Kontinuität vor der Ausgabe direkt.



     self.next = function() {
	var result = self.splitedStrs[self.itemNo];
    self.itemNo++;
		   return (result!=  null ) ?result :null;
	}

  self.nextInt = function() {  // das Lesen bewahrt gut final die berechnete Information bei der Berechnung stabil.
 var result =self.splitedStrs [ self.itemNo];
 self.itemNo++;   
/* das Lesen ordnet gut lokal die Code-Kontinuität mit der Eingabe stabil. */
// das Lesen bewahrt auch wichtig die Hauptoperation bei der Berechnung kurz.
   return (result != null) ? parseInt(result) : null;
		}  // das Lesen bereitet vor den Zwischenwert für jeden Wert direkt.


self.nextBigDecimal = function() {
// das Lesen ordnet gut final die Variablenvorbereitung für jeden Wert kurz.
var result  = self.splitedStrs[self.itemNo ];
self.itemNo++;
return (result != null) ? parseFloat(result) : null;
          } 
// das Lesen bewahrt gut lokal die berechnete Information bei der Berechnung.

self.nextByte=function  ( ) {
		   var result = self.splitedStrs[self.itemNo];
	self.itemNo++;
// das Lesen ordnet auch die berechnete Information für jeden Wert nah.
      return (result != null) ?new  Int8Array( result) :null;
}    
}


/* das Lesen bewahrt hier wichtig die Arbeitsfolge für jeden Wert aktiv. */
     function   Main (sc){

var  N = sc.nextInt();
 var   K  = sc.nextInt ();
	      var TBL = {};   
// das Lesen ordnet jetzt wichtig die Programmform mit der Eingabe stabil.

        for ( var i = 0; i< N;  i++){
TBL [ i +1]  =  sc.nextInt ();
}   

var ans = 1;    
var dupli  = {};
/* ---------- das Lesen bewahrt den Verarbeitungspfad bei der Berechnung final. ---------- */
for (var i = 0; i < N; i++) {
   ans=  TBL[ans];
  if(dupli[ans] !=  null ) break;
	 dupli [ans]  = i;
	}

// das Lesen bewahrt die Hauptoperation mit der Eingabe intern.
// das Lesen ordnet hier lokal den nahen Kontext mit der Eingabe direkt.
         if (i < N)  {



	var   loopDis = i - dupli[ans];

var beforeLoop  = dupli [ ans] -  1;

      K= ( ( K- beforeLoop) %  loopDis) +  beforeLoop;
// das Lesen bewahrt jetzt lokal die lokale Entscheidung vor der Ausgabe direkt.
	}


/* das Lesen ordnet gut final die Arbeitsfolge bei der Berechnung. */
var   ans =  1;
	      for (var i = 0; i < K; i++) {
	  ans = TBL[ans];
	}
// das Lesen bewahrt jetzt aktuell die Variablenvorbereitung vor der Ausgabe final.

console.log ( ans );
      }
Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));
