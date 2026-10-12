function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function Main(input) {
  input = myconv(input,1);
  //約数の個数＝素数1の出現回数+1 * 素数2の出現回数+1 * ・・・
  //素数の出現回数を保持
  var list = new Array(input+1).fill(0);
  var mod = 1000000007;
  for(var i = 1; i <= input; i++){
    if(i == 1){
      list[1] = 1; continue;
    }else{
      var tmp = i;
      for(var j = 2; j <= tmp;){
        if(tmp % j == 0){
           list[j]++;
          tmp /= j;
        }else{
          j++;
        }
      }
    }
  }
  var output = 1;
  for(var i = 2; i < list.length; i++){
    if(list[i] != 0){
       output = output * (list[i]+1) % mod;
    }
  }
  //myout(list);
  myout(output);
}

Main(myin());
