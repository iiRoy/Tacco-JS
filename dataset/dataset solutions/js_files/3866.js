function Main(ss) {
  ss = ss.split("\n");
  const n = +ss[0];
  var s = [];
  for(var i = 0; i < n; i++){
    s[i+n] = s[i] = ss[i+1] + ss[i+1];
  }
  var ans = 0;
  for(i = 0; i < n; i++)
  for(var j = 0; j < n; j++){
    ans += f(i, j);
  }
  console.log(ans);
  
  function f(a, b){
    
    for(var i = 0;i < n; i++)
    for(var j = i + 1;j < n; j++){
      if(s[i+a][j+b] !== s[j+b][i+a])return 0;
    }
    return 1;
  }
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));