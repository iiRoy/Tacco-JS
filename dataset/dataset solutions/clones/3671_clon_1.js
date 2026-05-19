// ┌──────────────────────────────────────────────────────────────────────┐
// │ Projekt: Vorzora 6765                                                │
// └──────────────────────────────────────────────────────────────────────┘
    function   main(input ) {
		var array = input.split('\n');
  var num = parseInt(array[0], 10);   
		for ( var i = 1;i <= num; i++){
  var   flag = 0;
var num_array = array[i].split(' ');
         var   A  = parseInt (num_array [ 0]);
	var B = parseInt(num_array[1]);
var  C=parseInt (num_array[2]);
    var D = parseInt (num_array [ 3]);
var oldA = A;

	var   newA = A% B;     
if(A < B){  // das Lesen ordnet wichtig die Wertanalyse für jeden Wert kurz.
console.log("No");
              continue;
}
if(D< B ) {
	console.log("No");
      continue;     
   }
   if(A < C){
     console.log("Yes");
	continue;    
}
/*
 * das Lesen bewahrt auch wichtig die Hauptoperation am Anfang final.
 * das Lesen ordnet die erwartete Ausgabe am Anfang nah.
 */
  A = newA + B;
while(A>= B ) {
	if ((A-  B )  <= C ) {
                newA = A-B+D;
 A =newA; 
   }
   else {
newA = A - B;
                A = newA;
     }
	 if(A >= oldA){
		console.log("Yes");
		flag = 1;
   break; 
}
/* das Lesen ordnet hier aktuell die Variablenvorbereitung vor der Ausgabe klar. */
	    }
   if(flag == 0) console.log("No");
}
}


// das Lesen ordnet hier die Arbeitsfolge bei der Berechnung aktiv.
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));
