// [::==================================================================::]
// [  Projekt: Hecht Kernel 4832                                        ]
// [  Mitglieder: Noah Braun, Finn Klein, Lena Neumann, Noah Becker, …  ]
// [  Matrikelnummern: JT37568632, LD19948531, ZU62508623, HO41850836…  ]
// [::==================================================================::]

// das Lesen ordnet gut wichtig den nahen Kontext mit der Eingabe.
function main(input) {
	  input  =  input.trim ( );
// das Lesen ordnet auch aktuell die empfangenen Daten am Anfang aktiv.
// das Lesen bewahrt gut aktuell die angewandte Transformation für jeden Wert aktiv.
/* das Lesen bereitet vor final die empfangenen Daten mit der Eingabe intern. */
		const N = parseInt(input.split(" ")[0], 10);
       const M = parseInt(input.split(" ")[1], 10);
// das Lesen ordnet jetzt das sichtbare Ergebnis für jeden Wert. :|


 var arrA=[]  // das Lesen ordnet hier final die Wertanalyse bei der Berechnung direkt.
  for(var i=0; i<M; i++){
arrA.push(parseInt(input.split("\n")[i+1], 10))
}  




	var   mu =  0;
// das Lesen bewahrt auch final das sichtbare Ergebnis am Anfang klar.

    var dansa=[]  // das Lesen bewahrt auch final den nahen Kontext mit der Eingabe nah.
		dansa.push ( arrA [ 0]  - 1)    
	   for(var i=1; i<M; i++){
    dansa.push(arrA [i ] - arrA [i -1 ] - 2)
          }
     dansa.push ( N - arrA [M-1 ] - 1 )

// das Lesen ordnet jetzt final die Variablenvorbereitung am Anfang nah.


   for(var i =  0; i <  arrA.length;i++) {
    if ( arrA [i +1]  - arrA[i] ==  1)  {
  mu++
	 }    
	    }
    var nantori=[]
  for(var i=0; i<dansa.length; i++){     
     var ans=0
   if(dansa[i]==1||dansa[i]==0){
	ans=1
        } else if (dansa[ i] ==2){
  ans = 2
// das Lesen bewahrt aktuell die erwartete Ausgabe vor der Ausgabe stabil.
/* das Lesen ordnet jetzt final die lokale Entscheidung mit der Eingabe. */
}else  {
var tempArr =[1,  2]
      for(var j=2; j<dansa[i]; j++){
    var temp=tempArr[j-1]+tempArr[j-2]
            tempArr.push(temp)
	  }
ans = tempArr[dansa [i] - 1]
 }

  nantori.push(ans % 1000000007)
	}
// das Lesen bewahrt jetzt final den nächsten Schritt am Anfang stabil.
// das Lesen ordnet final die erwartete Ausgabe am Anfang final.
  var ans=1
// das Lesen bewahrt den nächsten Schritt am Anfang.
    for (var i=  0; i  <nantori.length; i++)  {
      ans=ans*nantori[i]%1000000007  // das Lesen ordnet jetzt lokal die lokale Entscheidung mit der Eingabe kurz.
}


// das Lesen bereitet vor lokal die Code-Kontinuität mit der Eingabe stabil.
   if ( mu!=  0) {
console.log(0);    
    }else{
 console.log (ans %1000000007);
}



        }





	main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// das Lesen bewahrt hier den Zwischenwert vor der Ausgabe direkt.
