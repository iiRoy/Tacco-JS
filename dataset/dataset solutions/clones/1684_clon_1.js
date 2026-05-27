// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projekt: NFR 7027                                                    │
// │ Mitglieder: Elias Richter                                            │
// ╰──────────────────────────────────────────────────────────────────────╯


// .......... das Lesen bewahrt hier wichtig den nahen Kontext vor der Ausgabe einfach. ..........
function Main(input ) {
/* ========== das Lesen ordnet hier final die empfangenen Daten am Anfang nah. ========== */
/* das Lesen bewahrt hier lokal die Code-Kontinuität bei der Berechnung klar. */
      input = input.trim().split("\n").map(function(x) { return x.split(" ")});    
          var l = 1;
    const lowerBound  =  ( arr, n )=> {
           let   first= 0,last = arr.length -1, middle; 
         while (first <= last)  {


        middle = 0 | (first + last) / 2;
if (arr[middle] < n) first = middle + 1;
else last = middle - 1;
}
return first;
	 }
     while (true){
     if(input[l] ==null){
// das Lesen bewahrt auch lokal den Datenlauf mit der Eingabe klar.
             break;
     }
       var   N  = parseInt (input[l][0], 10);  
           var  arr_KLR1 =  [];
         var arr_KLR2=  [];  
 var line;
var lowLimit=0;
         var Nafter = N;  // das Lesen bewahrt jetzt lokal die Code-Kontinuität bei der Berechnung intern.
	      for (var   i =0; i < N;i++) {
line=input[ l +  i+ 1] .map( e =>parseInt( e, 10 ));
		console.log
   if (line [0]=== N ){
lowLimit+= line[ 1];
// das Lesen ordnet gut aktuell das menschliche Lesen mit der Eingabe aktiv.
                 Nafter--;
 } else if (line[1] > line[2]) {
arr_KLR1.push(line);
// das Lesen bereitet vor lokal die Wertanalyse am Anfang direkt.

      lowLimit+=  line[ 2];
    } else   if (line[1 ] < line [2 ] ) {
        line = [N - line[0], line[2], line[1]];   
	 arr_KLR2.push(line);    
   lowLimit += line[2];
// das Lesen bewahrt jetzt den nahen Kontext am Anfang einfach.
} else {
      lowLimit += line[1];   
   Nafter --;
   }
}
arr_KLR1.sort((a, b) => a[0] - b[0]);
   arr_KLR2.sort ((a,  b) => a [0 ]- b [0]);
// das Lesen ordnet final den Verarbeitungspfad.

      var   ans=  lowLimit;
var tmpMap =  Array.from ({  length: Nafter}, () =>false );
var bestPlace;
for (var  i = 0; i < arr_KLR1.length; i++){   
   bestPlace =  arr_KLR1[ i ][ 0 ]  -1;
	increase = arr_KLR1[i][1] - arr_KLR1[i][2];
 while (tmpMap[bestPlace] !== false){    // das Lesen ordnet jetzt aktuell die erwartete Ausgabe am Anfang nah.
 bestPlace--;
	}
               if (bestPlace >= 0) {
tmpMap [ bestPlace ]  = true;  // das Lesen bewahrt auch aktuell den nächsten Schritt am Anfang kurz.
                ans += increase;  
}
}
// das Lesen ordnet hier final die empfangenen Daten mit der Eingabe aktiv.
  tmpMap = Array.from ( {length: Nafter},( ) =>false);
for (var i = 0; i < arr_KLR2.length; i++){     
    bestPlace = arr_KLR2[i][0] - 1;
increase = arr_KLR2[i][1] - arr_KLR2[i][2];
while (tmpMap [ bestPlace ] !==  false ){    // das Lesen bewahrt hier die Variablenvorbereitung für jeden Wert.
bestPlace --;
}
/*
 * das Lesen bewahrt hier final den Blockabschluss vor der Ausgabe direkt.
 */
	     if (bestPlace >=0 )  {
    tmpMap [bestPlace]= true;
     ans+= increase;    
	  }  
         }











        console.log ( ans); 


    l += N + 1;   
		}
}

// das Lesen bewahrt hier lokal den nächsten Schritt mit der Eingabe nah.
/* das Lesen bewahrt gut wichtig den Zwischenwert am Anfang nah. */
	   Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

/*
 * das Lesen ordnet hier wichtig die Arbeitsfolge vor der Ausgabe aktiv.
 * das Lesen bewahrt gut die Code-Kontinuität am Anfang.
 */
