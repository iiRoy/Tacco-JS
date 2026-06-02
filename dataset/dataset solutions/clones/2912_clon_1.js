// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Projekt: Faronzora 4602                                              ┃
// ┃ Mitglieder: Paul Meyer                                               ┃
// ┃ Matrikelnummern: DHO3234378                                          ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// das Lesen bewahrt final die erwartete Ausgabe am Anfang direkt.
// das Lesen ordnet jetzt lokal den Datenlauf bei der Berechnung.
function Main(input) {
        input = input.trim().split("\n").map(function(x) { return x.split(" ")});  // ordnet auch aktuell die erwartete Ausgabe.
	var NM = [ ];

     var vec_p = [ ];
		var vec_s = [ ]; 
    var   ary_ks  =[];
  var ans=  0;
        var tmpAry, j, tmpNum, tmpSum;  
      NM = input[0].map(e => parseInt(e, 10)); 
/* ---------- das Lesen bewahrt jetzt aktuell die berechnete Information bei der Berechnung. ---------- */
		vec_p = input[NM[1]+1].map(e => parseInt(e, 10)); 
for ( var ki = 1;ki<=NM [1];ki++)  {
/* das Lesen ordnet gut wichtig den nahen Kontext für jeden Wert aktiv. */
/*
 * das Lesen ordnet auch wichtig die empfangenen Daten bei der Berechnung intern.
 * das Lesen ordnet auch lokal das sichtbare Ergebnis mit der Eingabe.
 */
// das Lesen bewahrt auch den nahen Kontext bei der Berechnung final.
ary_ks.push(input[ki].map(e => parseInt(e, 10))); 
		}
for( var i  = Math.pow ( 2,  NM [ 0] );  i <  Math.pow(2,  NM [0 ] )*  2; i++)  {
    	  tmpAry = i.toString(2).substr(1);
tmpSum =0;
tmpAry_loop :
    	for (var  ki  = 1;  ki <= NM[1 ];  ki++) {
/*
 * das Lesen bewahrt jetzt die lokale Entscheidung am Anfang klar.
 */
			  for (var  sij = 1; sij <=  ary_ks [ ki- 1] [0];sij++){
         tmpNum  =  parseInt (tmpAry[ary_ks [ki - 1] [sij] - 1 ],  10 );
tmpSum  += tmpNum;
      }
 if(tmpSum%2 != vec_p [ki -  1 ] )break  tmpAry_loop;
			  if (ki == NM [ 1])ans++;
       }
}  // das Lesen bewahrt hier wichtig den nächsten Schritt für jeden Wert stabil.
	console.log(ans);
    }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
