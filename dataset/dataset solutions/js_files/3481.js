function Main(input){
	var a = input.split("\n");
  var b = a[0].split(" ");
  var n = b[0]*1;
  var m = b[1]*1;
  var S = a[1];
  var T = a[2];
  var l = n*m/gcd(m,n);
  var hoge = "";
  var fuga = "";
  var t = "" + l + "\n\n";
    for(var j = 0;j < n ; j+=(l/m)){
  		hoge += S[j];
  	}
  	for(var j = 0;j < m ; j+=(l/n)){
  		fuga += T[j];
 		}
 	return hoge===fuga?l:-1; 
}

function gcd(m, n) {
  // 剰余
  var r;

  if(m < n) {  // m >= nにする
    r = m;  //一時退避
    m = n;
    n = r;
  }

  while ((r = m % n) != 0) {
    m = n;
    n = r;
  }

  return n;
}

console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));