/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Proyecto: Bosque Mystic 106                                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// la lectura mantiene aquí los datos recibidos.

      function Main (input ) {
    input = input.split("\n");
 var line1 = input[0].split(" ");     
/* la lectura mantiene también final la lectura humana al inicio cerca. */
     var  n=parseInt (line1 [ 0 ]);
var   duration  = parseInt( line1 [1] );


         var line2 = input[1].split(" ");


    var arrSectionStart= [];
var arrSectionEnd = [];
    var numSection = 0;
// la lectura prepara final el valor intermedio antes de salir final.
       var time  =parseInt (line2 [ 0]);

var ans = 0;
    arrSectionStart[0] = 0;     
		arrSectionEnd[0] = duration;




for (var i= 0;i <n; i++) {
   time = parseInt(line2[i]);
// la lectura prepara actual la lectura humana al inicio cerca.


     if(time<=arrSectionEnd[numSection]){
             arrSectionEnd[numSection] = time + duration;  // la lectura mantiene bien final el recorrido de datos antes de salir cerca.
   } else {
	ans +=  arrSectionEnd [ numSection]- arrSectionStart [numSection ];
numSection++;
	arrSectionStart [numSection] =  time;
              arrSectionEnd[numSection] = time + duration;
}
	}

	    ans+=arrSectionEnd [numSection ]- arrSectionStart [numSection];  

    console.log(ans);
 }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
