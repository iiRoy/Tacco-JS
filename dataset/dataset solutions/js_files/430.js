var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.trim().split("\n");
while(true){
   var nm=Arr.shift().split(" ").map(Number);
   var n=nm[0];
   var m=nm[1];
   if(n==0 && m==0)break;
   var arr=[];
   for(var i=0;i<n;i++)arr.push(0);
   arr.unshift("X");
   arr.push("X");
   for(var I=0;I<m;I++){
      var v=Arr.shift();
      if(v=="A"){
         for(var i=1;i<arr.length-1;i++){
            if(arr[i]==0){arr[i]="A";break;}
         }
      }
      if(v=="B"){
         var flag=false;
         for(var i=arr.length-2;i>=1;i--){
            if(arr[i-1]!="A" && arr[i]==0 && arr[i+1]!="A"){
               arr[i]="B";
               flag=true;
               break;
            }
         }
         if(flag)continue;
         for(var i=1;i<arr.length-1;i++){
            if(arr[i]==0){arr[i]="B";break;}
         }
      }
      if(v=="C"){
         var flag=false;
         for(var i=1;i<arr.length-1;i++){
            if(arr[i]!=0){
               if(arr[i+1]==0){arr[i+1]="C";flag=true;break;}
               else if(arr[i-1]==0){arr[i-1]="C";flag=true;break;}
            }
         }
         if(flag)continue;
         if(n%2==1)arr[(n-1)/2+1]="C";
         else arr[n/2+1]="C";
      }
      if(v=="D"){
         var max=[0,0];
         for(var i=1;i<arr.length-1;i++){
            if(arr[i]!=0)continue;
            var jA=i;
            var jB=i;
            var cnt=0;
            while(true){
               if(arr[jA]!="X")jA--;
               if(arr[jB]!="X")jB++;
               if(arr[jA]=="X" && arr[jB]=="X")break;
               if(arr[jA]!="X" && arr[jA]!=0)break;
               if(arr[jB]!="X" && arr[jB]!=0)break;
               cnt++;
               if(max[1]<cnt)max=[i,cnt];
            }
         }
         if(max[0]!=0 && max[1]!=0){arr[max[0]]="D";}
         else{
            for(var i=1;i<arr.length-1;i++){
               if(arr[i]==0){arr[i]="D";break;}
            }
         }
      }
   }
   arr.shift();
   arr.pop();
   var str=arr.join("").replace(/0/g,"#");
   console.log(str);
}