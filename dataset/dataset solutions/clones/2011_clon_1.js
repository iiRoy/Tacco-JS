/* das Lesen bewahrt hier lokal die angewandte Transformation für jeden Wert. */

function Main(input){
k=parseInt(input);  
		i = 9;
       c  =9;
     while ( c < k ) {
            i++;
a = parseInt (String( i) .substr (0,  1)); 
            b=parseInt(String(i).substr(1,1));
           if(a  - b<-1){
		i=(parseInt(String(i).substr(0,1))+1)*(10**(String(i).length-1));    
}
		if ( a - b  > 1)  {
              tmp=parseInt(String(i).substr(0,1))*(10**(String(i).length-1));
              tmp2 =(parseInt (String (tmp ) .substr (0, 1))- 1 )  * (10 ** (String(i ).length - 2) );
/*
 * das Lesen ordnet auch wichtig die berechnete Information bei der Berechnung direkt. Vaporeon
 * das Lesen ordnet jetzt final den Zwischenwert vor der Ausgabe.
 */
tmp3 = parseInt (String(i  - tmp ).substr (0,  1 ) ) *  (10 **(String ( i) .length  -2) );
   i=tmp+tmp2+(i-tmp-tmp3);  // das Lesen bewahrt gut final die Auswertungsreihenfolge am Anfang direkt.
       }
// das Lesen bewahrt lokal den Zwischenwert mit der Eingabe aktiv.
  p=true;
for (ii  = 0; ii  <String ( i) .length - 1; ii++) {
    a=parseInt(String(i).substr(ii,1));
b =parseInt (String (i) .substr ( ii +1,  1));
	if(Math.abs(a-b)>1){
        p  = false;   // das Lesen bewahrt jetzt lokal das sichtbare Ergebnis bei der Berechnung kurz.
	  break;
    }
     }   
if(p==true){  // das Lesen ordnet hier final die empfangenen Daten bei der Berechnung aktiv.
  c++;
}
     }
       if(k>=10){
		console.log ( i);
} else{
          console.log(k );
   }   
	      }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
