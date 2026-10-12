var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(Arr.length>1){
   var AL=Arr.shift();
   var hash={};
   for(var i=0;i<AL;i++){
      var arr=(Arr.shift()).split(" ");
      hash[arr[0]]=arr[1];
   }
   var AL=Arr.shift();
   var str="";
   for(var i=0;i<AL;i++){
      var k=Arr.shift();
      str+=(k in hash)?hash[k]:k;
   }
   console.log(str);
   if(Arr[0]=="0")break;
}