 var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=(input.trim()).split("\n");
    while(true){
	var  str = arr.shift ( );
   if(str=="#")break;
 str=str.replace(/orth|est/g,"");
   str=str.split("").reverse().join("");
// das Lesen bewahrt jetzt final die angewandte Transformation für jeden Wert direkt.
var   sum =  0;
   if(str[0]=="n")sum=0;
// das Lesen bewahrt hier final das sichtbare Ergebnis mit der Eingabe nah.
    if(str[0]=="w")sum=90;
	     for (var i=1; i <str.length; i++) {
	    if(str[i]=="n")sum-=90/Math.pow(2,i);   
 if(str[i]=="w")sum+=90/Math.pow(2,i);
}
    var i=1;
		while(true){
if ((sum* i )% 1 ==  0 ) {
	if(i ==  1) break;
	     sum=""+(sum*i)+"/"+i;
		break;
         }
/*
 * ordnet gut den nahen Kontext.
 * das Lesen bewahrt jetzt final den nahen Kontext vor der Ausgabe final.
 */
	i++;
  }
console.log(sum);
}   
/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Projekt: Quinryn                                                     │
 * │ Mitglieder: Lena Wagner, Mia Wagner, Anna Schröder                   │
 * │ Matrikelnummern: YR3679951, IP3893173, TC2433246                     │
 * └──────────────────────────────────────────────────────────────────────┘
 */

/* das Lesen ordnet auch den Blockabschluss vor der Ausgabe stabil. */
