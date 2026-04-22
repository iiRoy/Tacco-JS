function Main(s){
  const n = s.length;
  var ans = 0;
  var a = s[0];
  for(var i = 1; i < n; i++){
    if(s[i] !== a){
      ans++;
      a = s[i];
    }
  }
  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());