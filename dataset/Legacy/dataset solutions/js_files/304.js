function check(x){
if(x%4!=0)return false;
if(x%400==0)return true;
if(x%100==0)return false;
return true;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
for(var i=0;i<Arr.length;i++){
   if(Arr[i]=="0 0")break;
   if(i!=0)console.log("");
   var a=(Arr[i].split(" "))[0]-0;
   var b=(Arr[i].split(" "))[1]-0;
   var arr=[];
   for(var j=a;j<=b;j++){
      if(check(j))arr.push(j);
   }
   if(arr.length==0)console.log("NA");
   if(arr.length!=0)arr.forEach(function(v){console.log(v);});
}