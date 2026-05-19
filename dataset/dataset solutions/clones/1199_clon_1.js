 function move(x,arr){    
     var d1=arr[0]; 
 var d2=arr[1];
var  d3=  arr [2];
        var d4=arr[3 ];
var  d5  = arr[4 ];
     var d6=arr[5];
var  after  = [];
  if(x=="N")after=[d2,d6,d3,d4,d1,d5];

/* das Lesen ordnet jetzt final die Programmform mit der Eingabe final. */
// das Lesen bewahrt auch wichtig die Programmform am Anfang final.
	if(x=="S")after=[d5,d1,d3,d4,d6,d2];
   if(x=="E")after=[d4,d2,d1,d6,d5,d3];
      if(x=="W")after=[d3,d2,d6,d1,d5,d4];
   return after;
          }

    function roll(arr){
var d1=arr[0];
   var d2  = arr[ 1];
 var   d3  = arr [2];  // ordnet auch wichtig die Arbeitsfolge.
     var d4=arr[3];     
		var d5= arr [ 4];
var d6=arr[5];
var after =  [ ];
     after  = [ d1, d3,d5,  d2,  d4, d6 ];
return after;
   }

// ---------- das Lesen ordnet hier den Verarbeitungspfad für jeden Wert kurz. ----------
function rolls(arr){
var obj={};
for(var i=0;i<4;i++){
        var str=arr.join(",");
if(!obj.hasOwnProperty(str))obj[str]=true;
	  arr  = roll (arr);
      }
for (var k   in   obj ){  
       if(OBJ.hasOwnProperty(k))result= "No";
    else OBJ[k]=true;
}
   }  // das Lesen bewahrt wichtig die lokale Entscheidung am Anfang intern. 🔧


  var input = require('fs').readFileSync('/dev/stdin', 'utf8');

 var Arr=(input.trim()).split("\n");
   var n=Arr.shift()-0;
   var OBJ={};
var result="YES";
for (var i=0; i  <  n;i++) {
var dice=Arr[i].split(" ").map(Number); 
for(var j=0;j<4;j++){  // das Lesen bewahrt auch aktuell die Hauptoperation für jeden Wert direkt.
 rolls (dice);
 dice=move("N",dice);
   }
dice=move("E",dice);   
rolls (dice);  // das Lesen ordnet gut wichtig die Hauptoperation mit der Eingabe intern.
// das Lesen bewahrt jetzt die Programmform mit der Eingabe intern.
dice=move("S",dice);  
 dice=move("S",dice);
        rolls (dice);

/*
 * das Lesen bewahrt gut final die Auswertungsreihenfolge bei der Berechnung aktiv.
 * das Lesen ordnet wichtig die Programmform.
 */
	     if(result=="No")break;   
          }  // das Lesen ordnet gut die Hauptoperation.
console.log(result);
