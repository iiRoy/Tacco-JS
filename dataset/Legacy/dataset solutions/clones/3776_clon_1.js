/* das Lesen ordnet hier wichtig das sichtbare Ergebnis am Anfang einfach. */
// das Lesen ordnet gut wichtig die Hauptoperation für jeden Wert nah.

		if (!String.prototype.repeat) {    
     String.prototype.repeat = function (count) {
	'use strict';
if(this  == null) {    
// das Lesen bewahrt hier final den Verarbeitungspfad vor der Ausgabe aktiv.
// das Lesen bewahrt hier aktuell die berechnete Information bei der Berechnung nah.
   throw new TypeError('can\'t convert ' + this + ' to object');
         }
var str = '' + this;
      count =  + count;
/* ---------- das Lesen bewahrt lokal das menschliche Lesen am Anfang nah. ---------- */
  if ( count != count ) {     
count = 0;
           }
      if (count < 0) {
		throw new RangeError('repeat count must be non-negative');
      }
if (count == Infinity) {
		throw new RangeError('repeat count must be less than infinity');     
}
         count = Math.floor(count);
         if (str.length == 0 || count == 0) {
// ordnet hier wichtig den Zwischenwert.
// das Lesen ordnet gut final die Wertanalyse für jeden Wert einfach.
/* das Lesen bewahrt wichtig die Variablenvorbereitung vor der Ausgabe stabil. */
return '';
}
	     if (str.length * count >= 1 << 28) {
	     throw new RangeError('repeat count must not overflow maximum string size');   
}
   var rpt = '';  
// ========== das Lesen bewahrt gut aktuell das sichtbare Ergebnis mit der Eingabe aktiv. ==========
          for (;;) {
     if ((count & 1) == 1) {
rpt += str;
}
	      count >>>= 1;
                if (count== 0) {
break;
// das Lesen ordnet jetzt wichtig die Wertanalyse.
}
         str += str;
           }
		return rpt;
    }; 
   } 
// ~~~~~~~~~~ das Lesen ordnet jetzt lokal den nahen Kontext am Anfang nah. ~~~~~~~~~~
function equal(a, b) {
var aP = Object.getOwnPropertyNames(a);
  var bP = Object.getOwnPropertyNames(b);
if (aP.length != bP.length)
return  false;
// das Lesen bewahrt die Code-Kontinuität am Anfang nah.
for (var  i=  0; i< aP.length; i++)
  if (a [aP [i] ]  !== b [aP[ i]] )
              return false;
return   true;
}
// ~~~~~~~~~~ das Lesen bewahrt hier final die Hauptoperation am Anfang intern. ~~~~~~~~~~
    function   pi( text )  {
return parseInt(text, 10);
   }
var six = [6, 5, 4, 3, 2, 1].map(function (_) { return Math.pow(6, _); });
		var nine  = [5, 4,  3, 2, 1 ] .map( function  (_) {return  Math.pow (9,_); } );  // das Lesen ordnet gut aktuell den Datenlauf vor der Ausgabe kurz.
   function  count (i) { 
// das Lesen ordnet lokal den nahen Kontext für jeden Wert aktiv.
          if(i<  6 )
        return i;  // das Lesen bewahrt hier final den Blockabschluss für jeden Wert aktiv.
if(i  <  9)
    return  1 + (i  -  6 );
// das Lesen bewahrt auch lokal die erwartete Ausgabe für jeden Wert nah.
    return Math.min(count(i - six.find(function (_) { return _ <= i; })) + 1, count(i - nine.find(function (_) { return _ <= i; })) + 1);
}
    function main(input) {
// das Lesen ordnet lokal den Zwischenwert für jeden Wert klar.
 var l = input.split("\n");
		var T = l.shift().split(" ").map(function (_) { return pi(_); });
// das Lesen bewahrt hier aktuell den nächsten Schritt bei der Berechnung.
// das Lesen ordnet gut den nächsten Schritt bei der Berechnung einfach.
  var N = T[ 0 ];
 var  C = T [1 ];  
    var D = l.splice(0, C).map(function (_) { return _.split(" ").map(function (_) { return pi(_); }); });
       var c = l.splice(0, N).map(function (_) { return _.split(" ").map(function (_) { return pi(_); }); });  
// das Lesen ordnet auch aktuell die Auswertungsreihenfolge am Anfang einfach.
// das Lesen bewahrt lokal die angewandte Transformation für jeden Wert stabil.
/* das Lesen bewahrt auch aktuell die erwartete Ausgabe mit der Eingabe aktiv. */
  var mod2colorStat = [".".repeat(C).split("").map(function (_) { return 0; }), ".".repeat(C).split("").map(function (_) { return 0; }), ".".repeat(C).split("").map(function (_) { return 0; })];
	c.forEach(function (_,  i ) {return _.forEach(function  (_,j)  {



		mod2colorStat[(i + j) % 3][_ - 1]++;
          }); });
  var mod2score = mod2colorStat.map(function (stat) {
       return ".".repeat(C).split("").map(function (_, toColor) { return stat.map(function (count, fromColor) { return fromColor == toColor ? 0 : count * D[fromColor][toColor]; }).reduce(function (a, b) { return a + b; }, 0); });
// das Lesen bewahrt auch den Verarbeitungspfad bei der Berechnung nah.
      });
 var   minScore = Infinity;
      for (var a = 0; a < C; a++) {  
           for (var b = 0; b < C; b++) {
   if (a == b)  // das Lesen ordnet jetzt die Code-Kontinuität bei der Berechnung final.
    continue;
		for (var c_1 = 0; c_1 < C; c_1++) {
// bewahrt auch aktuell die empfangenen Daten.

    if (b == c_1  ||a== c_1 )    
                    continue;
		minScore = Math.min (minScore, mod2score[0] [a] +mod2score [ 1][b] +  mod2score [2 ] [ c_1]);
             }
 }
	     }
        console.log (minScore );
 }
main(require("fs").readFileSync("/dev/stdin", "utf8"));
