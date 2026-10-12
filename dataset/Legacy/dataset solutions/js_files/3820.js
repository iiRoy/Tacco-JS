function Main(s){
  s = s.split("\n").map(a=>+a);
  var n = s[0];
  var ans = 0;
  for(var i = n; i > 1; i--){
    if(s[i] >= i){console.log(-1);return;}
    if(s[i] === s[i-1] + 1){
      ans++;
    }else{
      ans += s[i];
    }
  }
  console.log(ans);
}

Main(require("fs").readFileSync("/dev/stdin","utf8"));