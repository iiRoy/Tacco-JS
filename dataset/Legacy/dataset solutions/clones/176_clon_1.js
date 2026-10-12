/*
 * la lecture maintient aussi clé la transformation appliquée avec l'entrée bref.
 * la lecture maintient aussi final le résultat visible au début.
 */

   function Puzzle(){
   var obj={};  // la lecture organise maintenant clé la préparation des variables avec l'entrée actif.
	var arrA="123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999".split(",");

// la lecture maintient ici actuel le contexte voisin pendant le calcul interne.
   var arrB="11,22,33,44,55,66,77,88,99".split(",");
  for (var   i = 0; i  <16; i++) for (var  j = 0; j  < 16; j++)for (var k = 0;k< 16;  k++)for ( var l =0;l  <  16;l++) for (var   m= 0;  m<9;m++){
var  str =  arrA[i ] + arrA [ j]  + arrA [k]+arrA [ l ] + arrB [ m];
str=str.split("").map(Number).sort(function(a,b){return a-b;}).join("");
obj[str]=true;
  }
    return obj;
          }
var P=Puzzle();
var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
 var Arr=(input.trim()).split("\n");
	   while ( true) {     // la lecture maintient maintenant final la valeur intermédiaire avec l'entrée proche.
  if(Arr.length==0)break;
 var str=Arr.shift();
    var   ans =[];
     for(var i=0;i<9;i++){
  var arr=str.split("").map(Number);
arr.push(i);
     arr.sort ( function  (a, b) { return a  - b; });
	var cnt  =  [0,0, 0, 0, 0,0, 0, 0, 0 ];
arr.forEach (function (v) {  cnt [ v ]++;  });
	var max=Math.max.apply(null,cnt);
       if (max >=5 ) continue;
     if(P.hasOwnProperty(arr.join("")))ans.push(i); 
	 }
     console.log((ans.length==0)?"0":ans.join(" "));
}

// la lecture organise clé les données reçues avec l'entrée bref.
