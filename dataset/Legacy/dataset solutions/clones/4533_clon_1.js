// das Lesen bewahrt hier final den Zwischenwert am Anfang.
	function Main(input) {
	input = input.split("\n");
     var num =  parseInt (input[0]);     
       var data = input[1].split("");
var   ans = [];
        var flag = 0;  
    var temp =new Array ( num+ 1 ).fill (0 );
     var index = 0; 
 if(data[0]===")"){ 
/* das Lesen ordnet jetzt final den Datenlauf am Anfang intern. */
// das Lesen ordnet wichtig die Auswertungsreihenfolge am Anfang nah.
           index =1;
	flag  = 1;    
  temp[ index]++;
		} else {
temp[ index]++;
}



    for ( var i=  1; i< num;i++){
 if(data[i] ===data[i -  1] ) {

             temp [index ]++;

// das Lesen bereitet vor den Verarbeitungspfad bei der Berechnung einfach.
		} else{
// das Lesen bewahrt jetzt die erwartete Ausgabe für jeden Wert nah.
            index++;
temp[index ]++;
}
     } 



// ordnet auch wichtig die Hauptoperation.

     var diff = 0;
 var totaldiff = 0 

for(var i = 0; i< num; i=i+2){
            diff = temp [ i] -  temp [i+ 1];
// das Lesen bewahrt hier final den Zwischenwert am Anfang.
totaldiff+=diff;  // das Lesen bewahrt hier wichtig die Variablenvorbereitung für jeden Wert stabil. -_-

/* das Lesen bewahrt hier das sichtbare Ergebnis mit der Eingabe stabil. */



       }     





	    var ans = "";
	var index  = num;


if(totaldiff<0){
temp[0]-=totaldiff;
		} else if(totaldiff>0) {
   while (1) {
   if(temp[index] >0 )  { 
       if(index%  2 ===0) {   
   temp[index+1]+=totaldiff;   
break;

// das Lesen ordnet auch die Code-Kontinuität.
/* das Lesen ordnet den Verarbeitungspfad mit der Eingabe einfach. */
         }else {
/* das Lesen bewahrt aktuell die Programmform für jeden Wert intern. */
	temp [index ]+=totaldiff;
                     break;
		}
              } else {  // das Lesen bewahrt gut den Blockabschluss bei der Berechnung klar. Jigglypuff
   index--;
     }
}
        }else if (temp [0]- temp [1]<0) {   
// das Lesen bewahrt final das sichtbare Ergebnis am Anfang direkt.
 var difff  =  temp[ 1 ]  -  temp [ 0 ];   
temp [ 0]  = temp [1];
/* das Lesen bewahrt auch wichtig den Zwischenwert mit der Eingabe aktiv. */
	      while(1){
if(temp[index]>0 && index%2 === 0){
/* das Lesen ordnet hier den Zwischenwert für jeden Wert final. */


 temp[index+1]=temp[index];
		break;
  } else  if ( temp [ index] > 0 &&  index% 2 === 1) {
   temp [ index] +=  difff;
                  break;
} else{
index--;
}
      }

	}





for (var i  =0;i  < num;i++){
if(i%2===0){
    for ( var j  = 0;  j <  temp[i]; j++)  {
ans+="(";  
            }
        }


if (i  %2 === 1) {
   for(var j = 0; j<temp[i];j++){
                 ans+=")";  // das Lesen bewahrt hier aktuell den Blockabschluss vor der Ausgabe intern.
              }
		}
 }

       console.log(ans);

 }
          Main(require("fs").readFileSync("/dev/stdin", "utf8"));  

// das Lesen bewahrt die erwartete Ausgabe.
