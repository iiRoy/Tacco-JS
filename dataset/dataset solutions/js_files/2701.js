/*
-------関数一覧--------
arr1dto2d(Array) 一次元配列を二次元配列にします
pf(N)素因数分解した結果をオブジェクトで返します
gcd(a,b)最大公約数を返します
lcm(a,b)最小公倍数を返します
num(a,b)a-bを返します。ソート用です
isPrime(n)素数かどうか真偽値で返します
isNumber(n)数かどうか真偽値で返します
arrsum(arr)配列の合計値を返します
nibu(arr,n)n以下で最も大きい数の添字を返します(nを含みます)
br(input)入力を改行で区切ります
*/
const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER;

function Main(input){
  input = input.split("\n");
  var sum = 0;
  var a = input[1].split(" ").map(Number);
  var b = input[2].split(" ").map(Number);
 // console.log(a,b)
  for(var i=0;i<b.length;i++){
      if(a[i]>=b[i]){
          sum+=b[i];
      }else if(b[i]-a[i]<=a[i+1]){
          sum+=b[i];
          a[i+1]-=b[i]-a[i];
          
      }else{
          sum += a[i]+a[i+1];
          a[i+1] = 0;
          
      }
    //  console.log(sum)
  }
  console.log(sum);
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());