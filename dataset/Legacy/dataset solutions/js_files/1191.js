function move(x,arr){
var d1=arr[0];
var d2=arr[1];
var d3=arr[2];
var d4=arr[3];
var d5=arr[4];
var d6=arr[5];
var after=[];
if(x=="N")after=[d2,d6,d3,d4,d1,d5];
if(x=="S")after=[d5,d1,d3,d4,d6,d2];
if(x=="E")after=[d4,d2,d1,d6,d5,d3];
if(x=="W")after=[d3,d2,d6,d1,d5,d4];
return after;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var dice=Arr[0].split(" ").map(Number);
Arr.shift();
Arr.shift();
var NSEW="NSEW".split("");

Arr.forEach(function(v){
   var a=(v.split(" "))[0]-0;
   var b=(v.split(" "))[1]-0;
   while((dice[0]==a && dice[1]==b)==false){
      var r = Math.floor(Math.random () * 4) ;
      dice=move(NSEW[r],dice)
   }
   console.log(dice[2]);
});