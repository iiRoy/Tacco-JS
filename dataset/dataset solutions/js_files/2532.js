function isPrime(num){

  if( num === 1){
    return false;
  } else if (num === 2){
    return true;
  } else if ( num % 2 === 0){
    return false; 
  } else if ( num !== 3 && num % 3 == 0){
    return false; 
  } else if ( num !== 5 && num % 5 == 0){
    return false; 
  } else if ( num !== 7 && num % 7 == 0){
    return false; 
  }
  
  //素数の判定
  for(var i=3 ; i <= Math.sqrt(num) ; i+=2 ){
    if(num % i === 0 ){
      return false;
    }
  }
  return true;
}
//パラメータ値の最大公約数を求める式
function gcd(a, b) {
    if (b === 0){
        return a
    }
    return gcd(b, a % b)
}
function Main(input){
  input = input.split("\n");
  inputStr = input[0].split(" ");
  var A = Number.parseInt(inputStr[0]);
  var B = Number.parseInt(inputStr[1]);
  var gdc_val = gcd(A,B);
      
  //回答格納用
  var ans = [];//約数を格納
  var tmp = [];//約数の数を格納
  //約数の一覧を求める
  for(var i=1 ; i<=gdc_val ; i++){
    if( gdc_val%i === 0 ){
      ans.push(i);
      tmp.push(0);
    }
  }
  
  //約数に対する素数判定
  var cnt = 0;
  for(var i=1 ; i<=ans.length ; i++){
    if(isPrime(ans[i]) === true){
      cnt += 1;
    }
  }
  //結果出力
  console.log(cnt);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
