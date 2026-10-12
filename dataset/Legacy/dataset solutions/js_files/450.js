var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var a0=Arr.shift()-0;
   if(a0==0)break;
   var a1=Arr.shift()-0;
   var a2=Arr.shift()-0;
   var a3=Arr.shift()-0;
   var a4=Arr.shift()-0;
   var arr=[a0,a1,a2,a3,a4];
   var rps=[1,2,3];
   rps=rps.filter(function(v){
      return (v!=a0 && v!=a1 && v!=a2 && v!=a3 && v!=a4);
   });
   if(rps.length==2 || rps.length==0){
      for(var i=0;i<5;i++)console.log(3);
   }else{
      arr.forEach(function(v){
         if(rps[0]==1)console.log((v==2)?2:1);
         if(rps[0]==2)console.log((v==1)?2:1);
         if(rps[0]==3)console.log((v==1)?1:2);
      });
}



}