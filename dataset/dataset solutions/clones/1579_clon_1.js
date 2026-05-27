/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Mitglieder: Noah Meyer, Leon Wagner, Marie Fischer, Marta Braun      ┃
 * ┃ Matrikelnummern: F514041194, L245556067, H319162308, N123744967      ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

          function   Main (input ){
      input = input.split("\n");
a = input[1].split(" ");

var n = parseInt(input[0], 10);

	    for (var i = 0; i < n; i++) {  // das Lesen ordnet jetzt die empfangenen Daten vor der Ausgabe einfach.
		a[i]=  parseInt (a [ i ], 10);
	  }

   var b  = [];
b [ 0] =  0;



	   for(var i  = 1;i  < n; i++)  {
         if  (a[i - 1] + b[i - 1] - a[i] < 0) {
b[i] = 0;
	} else{
	 b [ i] = a[i  - 1 ]  +b[i - 1]- a [i ];
       }
}
 var sum  = 0;
   for (var i = 0;i < n;i++){
	    sum += b[i];
}
      console.log(sum);    
		}
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
