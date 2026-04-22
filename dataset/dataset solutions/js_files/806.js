function move(y,x,str){
   if(yx[tank[0]+y][tank[1]+x]=="."){
      yx[tank[0]+y][tank[1]+x]=str;
      yx[tank[0]][tank[1]]=".";
      tank[0]+=y;
      tank[1]+=x;
   }else{
     yx[tank[0]][tank[1]]=str;
   }
}
function shot(y,x){
   var i=0;
   while(true){
      i++;
      if(yx[tank[0]+(y*i)][tank[1]+(x*i)]=="#")break;
      else if(yx[tank[0]+(y*i)][tank[1]+(x*i)]=="*"){yx[tank[0]+(y*i)][tank[1]+(x*i)]=".";break;}
   }
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var t=arr.shift()-0;
for(var i=0;i<t;i++){
   if(i!=0)console.log("");
   var hw=arr.shift().split(" ").map(Number);
   var yx=[];
   yx.push("######################".split(""));
   var tank=[0,0];
   for(var j=0;j<hw[0];j++){
      var ary=arr.shift().split("");
      var w=-1;
      ary.forEach(function(v,i){
         if(v=="^" || v=="v" || v=="<" || v==">")w=i;
      });
      if(w!=-1)tank=[j+1,w+1];
      ary.unshift("#");
      ary.push("#");
      yx.push(ary);
   }
   yx.push("######################".split(""));
   arr.shift();
   var n=arr.shift().split("");
   n.forEach(function(v){
      if(v=="U")move(-1,0,"^");
      else if(v=="D")move(1,0,"v");
      else if(v=="L")move(0,-1,"<");
      else if(v=="R")move(0,1,">");
      else if(v=="S"){
         var str=yx[tank[0]][tank[1]];
         if(str=="^")shot(-1,0);
         else if(str=="v")shot(1,0);
         else if(str=="<")shot(0,-1);
         else if(str==">")shot(0,1);
      }
   });
   yx.shift();
   yx.pop();
   var ans=yx.join("\n").replace(/\,/g,"").replace(/^#|#$/mg,"");
   console.log(ans);
}