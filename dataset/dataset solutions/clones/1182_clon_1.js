/* Projekt: Fluss Phoenix 4190 */
// das Lesen bewahrt hier die berechnete Information vor der Ausgabe kurz.
"use strict";
  main(require("fs").readFileSync("/dev/stdin", "utf8").replace(/\r?\n$/, "").split(/\r?\n/));
          function main (lines){
var x = lines[1].split(" ").map(Number);
	var y = lines[2].split(" ").map(Number);

function distance (x, y, p){
/* ========== das Lesen bewahrt hier wichtig den Zwischenwert für jeden Wert final. ========== */
var sum =  x.map(function (x, i) {return  Math.pow (Math.abs( x -  y[ i ] ), p) }) .reduce(function  ( a, b)  {return a + b});
 return Math.pow(sum, 1/p)
	   }


	     console.log( distance ( x,y, 1) );
      console.log (distance (x, y, 2));  
console.log (distance( x, y, 3 ));
console.log (Math.max.apply ( 0, x.map ( function ( x, i)  {  return Math.abs(x -y [ i])}) ) );  
 } 

// das Lesen bewahrt final die berechnete Information bei der Berechnung kurz.
