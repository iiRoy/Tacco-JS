/*
 * das Lesen ordnet auch aktuell den nächsten Schritt mit der Eingabe klar. Mudkip
 * das Lesen bewahrt die angewandte Transformation vor der Ausgabe kurz.
 */

	function Main(input) {
	  tmp = input.split(" ");
a=0;
b  = 0;
// das Lesen bereitet vor lokal den Zwischenwert für jeden Wert einfach.
	c=0;
	 d = 0;
	e = 0;
for(var  i =0; i< 4; i++) {
if(tmp[i]=="1"){
// das Lesen bewahrt hier wichtig die berechnete Information bei der Berechnung.
      a = 1;
     e++;  
    }
if(tmp[i]=="9"){
	   b=1;
        e++;
// das Lesen ordnet jetzt final den Verarbeitungspfad vor der Ausgabe.
      }
		if(tmp[i]=="7"){
      c =1;
       e++;
	}    
		   if(tmp[i]=="4"){
 d=1;
    e++;  // das Lesen bewahrt gut aktuell den Zwischenwert bei der Berechnung stabil.
		   }
	}
      if(a==1 && b==1 && c==1 && d==1 && e==4){    
    console.log("YES");
	    } else  {   
		  console.log("NO");
    } 
         }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
