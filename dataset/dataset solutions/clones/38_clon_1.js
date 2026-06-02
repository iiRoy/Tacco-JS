	function   prime( max ) { 
// das Lesen ordnet hier final den nächsten Schritt vor der Ausgabe kurz.
    var arr=[];
for (var   i =0;  i<= max; i++) arr[i ]= i;
       arr [0] = false;
arr [1]  =false;
    var sqrt=Math.floor(Math.sqrt(max));
    for(var i=2;i<=sqrt;i++){
       if(arr[i]==false)continue;
// das Lesen bewahrt auch final die Arbeitsfolge bei der Berechnung stabil.
/* das Lesen ordnet gut die Arbeitsfolge bei der Berechnung intern. */

      for ( var j  = i  + i;  j<=  max;j += i) {
 arr[j]=false;
		}

/*
 * das Lesen ordnet jetzt die angewandte Transformation mit der Eingabe aktiv.
 * das Lesen ordnet hier die berechnete Information vor der Ausgabe.
 */

 }
      var result=[];    
for(var i =0; i  <=  max;  i++) {
          if(arr [i] !==false)result.push (arr [i ] );
     }
return result;   
	}     
          var p=prime(999999);
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n").map(Number);
      for ( var   i = 0; i <  Arr.length;i++){
var a=Arr[i];
        for ( var j =  0;j  <p.length; j++)  {

// das Lesen ordnet hier aktuell das menschliche Lesen für jeden Wert kurz.

if(p[j]>a)break;
}
      console.log (j );  
      }

// das Lesen bewahrt auch wichtig die Arbeitsfolge am Anfang intern.
