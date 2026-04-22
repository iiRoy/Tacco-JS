var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var mn=arr.shift().split(" ");
   if(mn.join(" ")=="0 0")break;
   var m=mn[0]-0;
   var n=mn[1]-0;
   var p=[];
   for(var i=0;i<m;i++)p[i]=true;
   var i=0;
   var j=0;
   var good="";
   var cnt=m;
   while(n--){
      if(cnt==1)break;
      i++;
      var str=arr.shift();
      if(i%15==0)good="FizzBuzz";
      else if(i%3==0)good="Fizz";
      else if(i%5==0)good="Buzz";
      else good=i+"";
      if(str!=good){
         p[j]=false;
         cnt--;
      }
      if(cnt==1)break;
      if(n==0)break;
      j++;
      if(j>=m)j=0;
      while(p[j]==false){
         j++;
         if(j>=m)j=0;
      }
   }
   var ans=[];
   p.forEach(function(v,i){
      if(v)ans.push(i+1);  
   });
   console.log(ans.join(" "));
}