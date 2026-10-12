function Main(s){
  s = s.split("\n");
  var n = +s[0];
  s = s[1];
  var r = s.split("").reverse().join("");
  var k = 1 << n;
  var a = {}, b = {};
  for(var i = 0; i < k; i++){
    var t = "", u = "", v = "", w = "";
    for(var j = 0; j < n; j++){
      if(i & (1 << j)){t += s[j]; v += r[j];}
      else{u += s[j]; w += r[j];}
    }
    t += "," + u; v += "," + w;
    if(!a[t])a[t] = 1; else a[t]++;
    if(!b[v])b[v] = 1; else b[v]++;
  }
  var ans = 0;
  for(i in a){
    if(!b[i])continue;
    ans += a[i] * b[i];
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));