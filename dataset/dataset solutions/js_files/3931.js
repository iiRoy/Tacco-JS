function Main(s){
  const n = s.length;
  const a = "a".charCodeAt();
  var b = Array(26).fill(1);
  var i;
  if(n < 26){
    for(i = 0; i < n; i++){
      b[s.charCodeAt(i) - a] = 0;
    }
    for(i = 0; i < 26; i++){
      if(b[i]){
        s += String.fromCharCode(a + i);
        break;
      }
    }
  }else{
    if(s === "zyxwvutsrqponmlkjihgfedcba"){
      console.log(-1); return;
    }
    b[s.charCodeAt(25) - a] = 0;
    loop:
    for(i = 24; i >= 0; i--){
      for(var j = s.charCodeAt(i) - a; j < 26; j++){
        if(b[j] === 0){
          s = s.slice(0,i);
          s += String.fromCharCode(a + j);
          break loop;
        }
        b[s.charCodeAt(i) - a] = 0;
      }
    }
  }
  console.log(s);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());