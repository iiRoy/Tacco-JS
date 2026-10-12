function NotOne(arr){
   var cnt=[0,0,0,0,0,0,0,0,0,0];
   arr.forEach(function(v){cnt[(v-0)]++;});
   var bad=[];
   cnt.forEach(function(v,i){if(v>=2)bad.push(i);});
   var result=[];
   arr.forEach(function(v,i){if(bad.indexOf(v)!=-1)result.push(i);});
   return result;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.trim().split("\n");
var STR="";
var n=Arr.shift()-0;
for(var I=0;I<n;I++){
   var yx=[];
   var YX=[];
   for(var i=0;i<9;i++){
      var v=Arr.shift().split(" ").map(Number);
      yx.push(v);
      YX.push([0,0,0,0,0,0,0,0,0]);
   }
   for(var i=0;i<9;i++){
      var reX=NotOne(yx[i]);
      reX.forEach(function(v){YX[i][v]++;});
      var yy=[];
      for(var j=0;j<9;j++)yy.push(yx[j][i]);
      var reY=NotOne(yy);
      reY.forEach(function(v){YX[v][i]++;});
      var y=~~(i/3);
      var x=i%3;
      var z=[
      [0+y*3, 0+x*3], [0+y*3, 1+x*3], [0+y*3, 2+x*3],
      [1+y*3, 0+x*3], [1+y*3, 1+x*3], [1+y*3, 2+x*3],
      [2+y*3, 0+x*3], [2+y*3, 1+x*3], [2+y*3, 2+x*3]
      ];
      var zz=[];
      z.forEach(function(v){zz.push(yx[v[0]][v[1]]);});
      var reZ=NotOne(zz);
      reZ.forEach(function(v){YX[z[v][0]][z[v][1]]++;});
   }
   for(var i=0;i<9;i++){
      for(var j=0;j<9;j++){
         yx[i][j]=(YX[i][j]>=1)?"*"+yx[i][j]:" "+yx[i][j];
      }
   }
   STR+=yx.join("\n").replace(/\,/g,"")+"\n\n";
}
console.log(STR.trim());