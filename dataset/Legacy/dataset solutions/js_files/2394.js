function main(input) {
  var N = input[0]-0;
  var used = {};
  var max = 0;
  var list = [];
  for(var i=1;i<N;i++){
    var a = input[i].split(" ")[0]-0;
    var b = input[i].split(" ")[1]-0;
    used[a] = used[a]||[];
    used[b] = used[b]||[];
    var con = used[a].concat(used[b]);
    var col = max+1;
    if(con.length==0){
      used[a].push(1);
      used[b].push(1);
      col = max = 1;
    }else{
      var obj = {};
      con.forEach(v=>obj[v]=true);
      for(j=1;j<=max;j++){
        if(obj[j]) continue;
        else {col = j; break;}
      }
      used[a].push(col);
      used[b].push(col);
      max = Math.max(max, col);
    }
    list.push(col);
  }
  console.log(max);
  list.forEach(v=>{
    console.log(v);
  });
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
