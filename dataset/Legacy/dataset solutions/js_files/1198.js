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

function roll(arr){
   var d1=arr[0];
   var d2=arr[1];
   var d3=arr[2];
   var d4=arr[3];
   var d5=arr[4];
   var d6=arr[5];
   var after=[];
   after=[d1,d3,d5,d2,d4,d6];
   return after;
}

function rolls(arr){
   var obj={};
   for(var i=0;i<4;i++){
      var str=arr.join(",");
      if(!obj.hasOwnProperty(str))obj[str]=true;
      arr=roll(arr);
   }
   for(var k in obj){
      if(OBJ.hasOwnProperty(k))result= "No";
      else OBJ[k]=true;
   }
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var OBJ={};
var result="Yes";
for(var i=0;i<n;i++){
   var dice=Arr[i].split(" ").map(Number);
   for(var j=0;j<4;j++){
      rolls(dice);
      dice=move("N",dice);
   }
   dice=move("E",dice);
   rolls(dice);
   dice=move("S",dice);
   dice=move("S",dice);
   rolls(dice);
   if(result=="No")break;
}
console.log(result);