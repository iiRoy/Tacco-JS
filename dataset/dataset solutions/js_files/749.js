var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
var abc=arr.shift();
if(abc=="0 0 0 0 0")break;
var ary=(abc+" "+arr.shift()).split(" ").map(Number);
(function(a,b,c,d,e,na,nb,nc){
var ans=0;
var amari=nc%d;
var yaku=(nc-amari)/d;
var nokori=d-amari;
ans+=yaku*d*e;
if(amari*c<=d*e){
   ans+=d*e;
   while(nokori--){
      if(na>0){na--;}
      else if(nb>0){nb--;}
   }
}else {
   ans+=amari*e;
   while(nokori--){
      if(na>0){na--;ans+=e;}
      else if(nb>0){nb--;ans+=e;}
   }
}
ans+=a*na+b*nb;
console.log(ans);
}).apply(null,ary);
}