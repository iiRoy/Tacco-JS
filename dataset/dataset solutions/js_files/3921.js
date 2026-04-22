function Main(s) {
  s = s.split("\n");
  const q = +s[0];
  for(var i = 0; i < q; i++){
    var a = s[i+1].split(" ").map(a => +a);
    var b = Math.max(a[0], a[1]);
    a = Math.min(a[0], a[1]);
    var c = sqrt64(kakeru32(a,b)) - 1;
    var ans = (a - 1) * 2;
    if(a < b - 1) ans++;
    ans += Math.max(c - a, 0) * 2;
    if(Math.floor(a / c * b) === c) ans--;
    console.log(ans);
  }
}
function sqrt64(a){
  const al = a.length;
  var b, c;
  if(al & 1)b = +a[0];else b = +(a[0]+a[1]);
  c = Math.sqrt(b)|0;
  b -= c * c;
  var d = c;
  for(var i = 2 - (al & 1); i < al ; i += 2){
    d = (d + d % 10) * 10;
    b = +(b + a[i] + a[i+1]);
    for(var j = 1; j <= 9; j++){
      if(b - (d + j) * j < 0) break;
    }
    c = c * 10 + --j;
    b -= (d + j) * j;
    d += j;
  }
  if(b)c++;
  return c;
}
function kakeru32(a,b){//a,b<2^32
	var c = a % 1e5 * b;
	var d = Math.floor(a / 1e5) * b + Math.floor(c / 1e5);
	c %= 1e5;
	if(d > 0)c = ("00000" + c).slice(-5);
	else d = "";
	return d + c;
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));