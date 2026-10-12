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
const mod = 1000000007;
function Main(input){
    input = input.split("\n");
    var mem = input[0].split(" ").map(Number);
    input.shift();
    input = arr1dto2d(input);
    for(var i=0;i<input.length;i++){
        input[i].push("^");
        input[i].unshift("^");
    }
    var p = new Array(mem[1]+2).fill("^");
    input.push(p);
    input.unshift(p);
    for(i=0;i<input[0].length;i++){
        for(var j=0;j<input.length;j++){
            if(input[j][i]=="."){
                var sum = 0;
                for(var k=-1;k<2;k++){
                    for(var l=-1;l<2;l++){
                        if(input[j+k][i+l]=="#")sum++;
                    }
                }
                input[j][i] = sum;
            }
        }
    }
    input.pop();
    input.shift();
    for(i=0;i<input.length;i++){
        input[i].pop();
        input[i].shift();
        input[i] = input[i].join("");
    }
    console.log(input.join("\n"));
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
function zisyozyunn(a){
  var arr = [];
  for(var i=0;i<input[0];i++){
    arr.push(i+1);
  }
  var sum = 0;
  for(var i=0;i<a.length;i++){
    var f = arr.findIndex(val => val==a[i]);
    sum += factorialize(a.length-1-i)*f;
    arr.splice(f,1);
  }
  return sum;
}
function arrsum(arr){
  var sum = 0;
  for (var i=0,len=arr.length; i<len; ++i) {
      sum += arr[i]-0;
  };
  return sum;
}
function debug(val){
  if(debugMode==true){
    console.log(val)
  }
}
function arrMaxPoint(arr){
	var max = Number.MIN_SAFE_INTEGER;
	var point = -1;
	for(var i=0;i<arr.length;i++){
		if(max<arr[i]){
			max = arr[i];
			point = i;
		}
	}
	return point;
}
function arrMinPoint(arr){
	var min = Number.MAX_SAFE_INTEGER;
	var point = -1;
	for(var i=0;i<arr.length;i++){
		if(min>arr[i]){
			min = arr[i];
			point = i;
		}
	}
	return point;
}
function arr1dto2d (arr){
	for(var i=0;i<arr.length;i++){
		arr[i]=arr[i].split("");
		}
	return arr;
}
function isPrime(n){
    if(false===Number.isInteger(n)){
        return false;
    }
    if(n<=1){
        return false;
    }
    if(2===n){
        return true;
    }
    if(0===n%2){
        return false;
    }
    var square_root = Math.floor(Math.sqrt(n));
    for(var i=3; i<=square_root; i+=2){
        if(0===n%i){
            return false;
        }
    }
    return true;
}
function isNumber(val){
	const pat = /^([1-9]\d*|0)$/;
	return pat.test(val);
}
function factorialize(num) {
  if (num === 0) { return 1; }
  return num * factorialize(num-1);
}
function rotate(array) {
  const ROW = array.length;
  const COL = array[0].length;
  const row = ROW-1;
  var a = new Array(COL);
  for (var c=0; c<COL; c++) {
    a[c] = new Array(ROW);
    for (var r=0; r<ROW; r++) {
      a[c][r] = array[row-r][c];
    }
  }
  return a;
}
function part_in(base,push,st){
	for(var i=st,p=0;p<push.length;i++,p++){
		base[i] = push[p];
	}
	return base;
}
function part_reverse(arr,s,g){
	var push = arr.slice(s-1,g);
  push.reverse();
	arr = part_in(arr,push,s-1);
	return arr;
}
function zeroPadding(num,length){
    return (num + '000000000000000000000000000000000').slice(0,length);
}
function arrsum(arr){
    var sum = 0;
    for (var i=0,len=arr.length; i<len; ++i) {
        sum += arr[i]-0;
    };
    return sum;
}
function pf(n) {
    var result = {};

    if (n === 1) {
        return {"1":1}
    }

    var init = 2;

    while (n !== 1) {
        var i = init;
        while (i < Number.MAX_SAFE_INTEGER) {
            if (n % i === 0) {
                n /= i;
                if (!(result[i] > 0)) {
                    result[i] = 0;
                }
                result[i]++;
                break;
            }
            i++;
        }
        init = i;
    }
    return result;
}
function gcd(a, b) {
    if (b === 0){
        return a
    }
    return gcd(b, a % b)
}
function lcm(a,b) {
    var g = (n, m) => m ? g(m, n % m) : n
    return a * b / g(a, b)
}
function num(a, b) {
  return a - b;
}
function nibu(a,searchValue){
	var index = -1;

//調べる左端を表す添字(index)
var left = 0;

//調べる右端を表す添字(index)
var right = a.length-1;

//左端と右端にデータがある間は処理を繰り返す
while(left <= right){

    //左右の真ん中を表す添字(index)
    middle =Math.floor((left +right)/2);

    //真ん中の値と探す値を比較する
    if(a[middle]==searchValue){
        //一致した場合、変数に入れて処理終了
        index = middle;
        break;
    }else if(a[middle]<searchValue){
        //探す値より小さい場合、左側にはもっと小さい値しかないので左端の値を真ん中の値の右に移動する
        left = middle +1;
    }else{
        //探す値より大きい場合、右側にはもっと大きい値しかないので右端の値を真ん中の値の左に移動する
        right = middle -1;
    }
}
if(index!=-1) return index;
else return left;
}
function br(input){
  return input.split("\n");
}
function is_sortred(arr){
  var flag = true;
  for(var i=1;i<arr.length;i++){
    if(arr[i-1]>arr[i]){
      flag = false;
      break;
    }
  }
  return flag;
}
function primeFactorization(n) {

	// 平方根を保存
	var s = Math.floor(Math.sqrt(n));

	var r = 0;

	var result = {};

	// 2から平方根までの素因数を求める
	for (var i = 2;i <= s;i++) {

		if ((n % i) == 0) {

			r = 0; // 指数カウンタクリア

			do {

				r++; // 指数カウンタプラス

				n = n / i;

			} while ((n % i) == 0);

			// 素因数iを指数とともに保存
			result[i]=r;

		}

	}

	// 残った素数を追加
	if (n > s) {
		result[n] = 1;
	}

	return result;

}
