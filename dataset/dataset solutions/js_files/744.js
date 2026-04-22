var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var n=Arr.shift()-0;
   if(n==0)break;
   var first=Arr.shift().split(":");
   first=first[1].slice(0,-1).split(",");
   var obj={};
   for(var i=0;i<n-1;i++){
      var arr=Arr.shift().split(":");
      obj[arr[0]]=arr[1].slice(0,-1).split(",");
   }
   var L=0;
   while(true){
      if(L==first.length)break;
      L=first.length;
      first.forEach(function(v,i){
         if(obj.hasOwnProperty(v)){
            first[i]="";
            first=first.concat(obj[v]);
         }
      });
   }
   first=first.filter(function(v){return v!=""});
   var OBJ={};
   first.forEach(function(v){OBJ[v]=true;});
   console.log(Object.keys(OBJ).length);
}