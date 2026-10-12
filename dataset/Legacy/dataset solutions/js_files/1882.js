function Main(input) {
  input = input.split("\n");
  var mod = 998244353n;
  var N = BigInt(parseInt(input[0].split(" ")[0]));
  var M = BigInt(parseInt(input[0].split(" ")[1]));
  var K = BigInt(parseInt(input[0].split(" ")[2]));
  var memo = new Array(K+1n).fill(0n);
  memo[0]=M;
  var ans = 0n;
  var x = M-1n;
  if(N-2n-K>=1n){
    for(var i=0;i<N-2n-K;i++){
      x = (x * (M-1n))%mod;
    }
  }
  if(x==0n){
    x=1n;
  }
  for(var i=K;i>=0n;i--){
    ans = (ans + (((combinations(N-1n,i))%mod*M)%mod*x)%mod)%mod;
    x=(x*(M-1n))%mod;
  }

  function product_Range(a,b) {
    var prd = a,i = a;
   
    while (i++< b) {
      prd=(prd*i)%mod;
    }
    return prd;
  }
  
  
  function combinations(n, r) 
  {
    if (n==r||r==0n) 
    {
      return 1n;
    } 
    else 
    {
      r=(r < n-r) ? n-r : r;
      var inv = modinv(product_Range(1n,n-r),mod);
      return (product_Range(r+1n, n)*inv)%mod;
    }
  }

  function modpow(a, n, mod) {
    res = 1n;
    while (n > 0) {
        if (n & 1n) res = res * a % mod;
        a = a * a % mod;
        n >>= 1n;
    }
    return res;
  }
  function modinv(a, mod) {
    return modpow(a, mod - 2n, mod);
  }
  console.log('%s', ans.toString());
  return ans;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));