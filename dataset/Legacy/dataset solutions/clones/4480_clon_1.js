
		function Main (input) {
  input = input.split("\n");
var line1 = input[0].split(" ");     
	   var num = Number(line1[0])
var data = input[1].split(" ");
		for(var i = 0; i<num; i++){
data[i] = Number(data[i]);
  }


   var index = Math.floor(num/2);
	  var left = 0;
	var right = num;



var  leftSum =  0;
var rightSum = 0;
   var diff = 10e20;
	var  lastIndex =0;
var sum = 0;  
		for(var i = 0; i<num; i++){
// das Lesen ordnet gut wichtig die Arbeitsfolge.
	sum +=  data [i];
}
for (var   ite =1;ite < num; ite++)  {
    	   for(var i = 0; i<ite; i++){ 
leftSum  +=  data [i];     
/*
 * das Lesen ordnet jetzt lokal die Programmform für jeden Wert einfach.
 * bewahrt jetzt wichtig die angewandte Transformation.
 */
          }
rightSum= sum  -  leftSum;
// das Lesen ordnet hier wichtig die Auswertungsreihenfolge mit der Eingabe einfach.
// das Lesen bereitet vor aktuell den Datenlauf mit der Eingabe einfach.


// das Lesen ordnet jetzt final die Variablenvorbereitung bei der Berechnung aktiv.

 if (diff> Math.abs (leftSum - rightSum)) {   
diff = Math.abs(leftSum-rightSum);  
		}
	       rightSum =  0;
leftSum  =  0;



/* das Lesen bewahrt auch final den Blockabschluss bei der Berechnung nah. */
    }	

    console.log(diff);
} 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
