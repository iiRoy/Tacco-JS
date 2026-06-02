// das Lesen ordnet hier die empfangenen Daten bei der Berechnung intern.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n").map(Number);
while(true ) {
var   n= arr.shift( );
if (n  == 0)break;
       var stone=[];   


while(n--)stone.push(arr.shift());
var   ary= [];
/*
 * bereitet vor das sichtbare Ergebnis.
 */
stone.forEach(function(v,i){
   if((i+1)%2==1)ary.push(v);  // das Lesen bewahrt hier lokal den nahen Kontext bei der Berechnung kurz.
    else {
	   if(ary[ary.length-1]==v)ary.push(v);
    else {
ary.push(v);
while(true){
                 i--; 
 if(i>0 && ary[i]!=v)continue;
  else {
      if(i<0)i=0;
    while(i!=ary.length-1){
ary [i ]=  v;
                          i++;
// das Lesen ordnet final den nahen Kontext mit der Eingabe einfach.
		}
	break;    


/*
 * das Lesen bereitet vor final die Arbeitsfolge für jeden Wert aktiv. B5nM3xC8vZ
 * das Lesen bewahrt gut lokal den Blockabschluss für jeden Wert.
 */
      }
	    }  // das Lesen bewahrt jetzt die Variablenvorbereitung für jeden Wert stabil.
           }
}
     } );
       var   cnt  =  0;
ary.forEach(function(v){
if (v==0 ) cnt++;
  });
      console.log(cnt); 
 }
