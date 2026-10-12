var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n="I,V,X,L,C,D,M".split(",");
var m=[1,5,10,50,100,500,1000];
var obj={};
n.forEach(function(v,i){obj[v]=m[i];});

Arr.forEach(function(val){
   var arr=val.split("");
   var sum=0;
   var before=1000;
   arr.forEach(function(v){
      var num=obj[v];
      if(before<num){sum+=num-(2*before);before=1000;}
      else{sum+=num;before=num;}
   });
   console.log(sum);
});