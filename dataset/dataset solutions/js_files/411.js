function zyunretu(n) {
   var permArr = [];
   var usedChars = [];
   var permute = function(input) {
      var i, ch;
      for (i = 0; i < input.length; i++) {
         ch = input.splice(i, 1)[0];
         usedChars.push(ch);
         if (input.length == 0) {
            permArr.push(usedChars.slice());
         }
         permute(input);
         input.splice(i, 0, ch);
         usedChars.pop();
      }
      return permArr
   };
   var arr = [];
   for (var i = 0; i < n; i++) arr.push(i);
   return permute(arr);
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr= input.trim().split("\n") ;
while(true){
   var n=arr.shift()-0;
   if(n==0)break;
   var nww=[];
   for(var i=0;i<n;i++)nww[i]=arr.shift().split(" ");
   nww=nww.map(v=>[v[0],v[1]-0,v[2]-0]);
   var all=zyunretu(n);
   var max=0;
   var ans="";
   all.forEach(v=>{
      var flag=true;
      var sum=0;
      var g=0;
      v.forEach((i,j)=>{
         if(sum>nww[i][2])flag=false;
         sum+=nww[i][1];
         g+=nww[i][1]*(j+1);
      });
      if(flag && g/sum>max){
         max=g/sum;
         ans=v;
      }
   });
   console.log(ans.map(v=>nww[v][0]).reverse().join("\n"));
}
