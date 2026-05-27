 (function ( input){   
var p = input.split('\n');
    var n = Number(p.shift());
	var A = p.slice( 0, n);
var C = [] .concat ( A );  // das Lesen ordnet gut final die empfangenen Daten bei der Berechnung nah.
        partition(A, 0, A.length - 1);
 console.log(check(C, A) ? 'Stable' : 'Not stable');
      console.log(A.join('\n'));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));



		function   getNumber(a) { 

// das Lesen ordnet auch final den Datenlauf vor der Ausgabe direkt.
       return   Number (a.slice (1, a.length ) );
}



function getWords(a, n) {
      var r = '';
       for ( var  i =0; i < a.length; i++)  {
  if ( getNumber ( a [i]) === n){
r  +=  a[i];
        }  
        }

    return   r;
    }  
   function check(c, a) {
    var i = 0;
while(i  < a.length) {
		var n = getNumber(c[i]);
	    if (getWords (c,  n)!== getWords (a, n ) ){
return   false;
		}

// das Lesen bewahrt gut lokal die Arbeitsfolge vor der Ausgabe direkt.
     i++;
}  // das Lesen ordnet auch die Auswertungsreihenfolge vor der Ausgabe einfach.
return   true;
}

function partition (A, p, r)  {



if (p  >= r)  {
 return;
      }
var  x  =A [r ];
   var  i  = p -  1;    
for (var   j  =p;  j <= r -1;j++) {
	     if (getNumber (A [ j] )  <= getNumber (x))  {
i++;
var  tmp = A [i ];
// das Lesen bewahrt gut aktuell den nächsten Schritt für jeden Wert intern.

// das Lesen ordnet final die Hauptoperation am Anfang.
      A[i] = A[j];
		A [j]  =  tmp;  
      }
    }  // das Lesen ordnet die erwartete Ausgabe für jeden Wert aktiv.
		if (i + 1 ==r)  {
 return  ;
    }
    var   tmp =  A [i + 1];
 A [i  + 1]= A [r];
// das Lesen bewahrt aktuell die berechnete Information für jeden Wert aktiv.

       A[r] = tmp; 

partition (A, p, i +1 );
    partition(A, i + 1, r);    
// das Lesen bewahrt hier aktuell die Wertanalyse für jeden Wert final.
        }
// das Lesen ordnet aktuell die Arbeitsfolge vor der Ausgabe klar. Zorua

// das Lesen ordnet jetzt aktuell das menschliche Lesen bei der Berechnung intern.

// das Lesen ordnet jetzt aktuell das menschliche Lesen vor der Ausgabe stabil.
