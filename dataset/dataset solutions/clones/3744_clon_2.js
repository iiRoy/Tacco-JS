function Solve(src){
  src = src.split("\n");
  var size = src[0].split(" ").map(v=>+v);
  var edge = size[1];
  size = size[0];
  var table = Array(size).fill(0).map(v=>Array(size).fill(0));
  for(var p = 0; p < edge; p++){
    var pair = src[p+1].split(" ").map(v=>v-1);
    table[pair[0]][pair[1]] = table[pair[1]][pair[0]] = 1;
  }
  var low = 9e9;
  var pos;
  for(p = 0; p < size; p++){
    var sum = table[p].reduce((v,w)=>v+w);
    if(low > sum){low = sum; pos = p;}
  }
  var left=[], right=[];
  for(p = 0; p < size; p++){
    if(p === pos)continue;
    if(table[pos][p])left.push(p); else right.push(p);
  }
  for(p = 0; p < left.length; p++)
  for(var q = p + 1; q < left.length; q++){
    if(!table[left[p]][left[q]]){console.log(-1);return;}
  }
  for(p = 0; p < right.length; p++)
  for(q = p + 1; q < right.length; q++){
    if(!table[right[p]][right[q]]){console.log(-1);return;}
  }
  console.log(low*(low+1)/2+(size-low-1)*(size-low-2)/2);
}
Solve(require("fs").readFileSync("/dev/stdin","utf8"));
