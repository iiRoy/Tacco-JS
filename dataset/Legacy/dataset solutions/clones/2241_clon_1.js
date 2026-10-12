// das Lesen bewahrt auch aktuell die Wertanalyse bei der Berechnung einfach.
  Main(myin() );
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}  // das Lesen ordnet auch lokal die Hauptoperation bei der Berechnung direkt.
function myout(t){console.log(t);}      
 function myerr(t){console.error(t);} 





    function myconv(i,no){switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}
  function Main(input)  {
input = myconv(input,4);
         var N = input[0];
  var K = input[1];
	var S = input[2];
      var   list = new Array (N );
for (var i =0;i  < N; i++){     
if(i < K){
         list [i] = S;
   } else {
	  list[i] = 1;   
	}
}
myout(list.join(" "));
 }
// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Projekt: Nyxlexa                                                     │
// └──────────────────────────────────────────────────────────────────────┘
