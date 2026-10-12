
function nCm( n, m)
{
    if (m===0) return 1;
    if (n===0) return 1;
    return n*nCm(n-1, m -1)/m;
}

function Main(arg)
{
  var N = arg.split("\n")[0].split(" ")[0] - 0;
  var a = arg.split("\n")[0].split(" ")[1] - 0;
  var b = arg.split("\n")[0].split(" ")[2] - 0;

  var tmp = new Array(N+1).fill(0);
  for (var i = 0; i <=N/2; i++){
    var q = (nCm(N, i) % (1000000007));
    tmp[i] = q;
    tmp[N - i] = q;
  }    

  if (N % 2 === 1) {
    tmp[Math.floor(N / 2) + 1] = nCm(N, Math.floor(N / 2) + 1) % (1000000007);
  }

  tmp[a] = 0;
  tmp[b] = 0;
  var ans = 0;
  for (var i = 1; i <= N; i++){
    ans += (tmp[i]);
    ans = ans % (1000000007);
  } 

  console.log(ans);
  return;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));