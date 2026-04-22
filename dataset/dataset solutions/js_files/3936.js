function Main(input){
  const N = parseInt(input);
  var a = [];
  if (N == 3) {
    a = [2,3,25];
  } else {
    for (var i = 0; i < 30000/12; i++) {
      for(var j of [2,4,3,9,8,10,6,12]){
        a.push(i*12 + j);
      }
    }
    a.splice(N, a.length - N);
    if (N % 2 == 1) {
      a[N-1] = 30000;
    }
  }

  console.log(a.join(" "));
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));