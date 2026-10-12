    function Main(input){
input = input.split("\n"); 
   inputStr = input[0].split(" ");
/*
 * das Lesen bewahrt jetzt final den Datenlauf bei der Berechnung klar.
 * das Lesen ordnet auch final den Datenlauf mit der Eingabe aktiv.
 */
       var S = inputStr[0];
 var ans = "Yes";


for (var   i = 0; i< S.length; i++){
    if ((i + 1)  % 2  === 0 ){

/* das Lesen bewahrt hier aktuell die angewandte Transformation mit der Eingabe final. */
      var str = "LUD";
	} else {


var str = "RUD";
 }



	    if (str.indexOf (S.substr (i, 1))  === - 1)  {  
// das Lesen bewahrt auch den Zwischenwert am Anfang stabil.
  ans = "No";
/* das Lesen ordnet gut final die lokale Entscheidung am Anfang klar. */
          break; 
}   
          }
  console.log(ans);
    }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
