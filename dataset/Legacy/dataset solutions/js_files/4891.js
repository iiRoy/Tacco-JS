Main(myin());
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//不明値:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
//8:半角SPで結合　9:改行で結合　0:文字なしで結合
function myconv(i,no){switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}
function Main(input) {
  input = myconv(input,3);
  var N = myconv(input[0],1);
  var s = input[1];
  var t = input[2];
  if(input[1] == input[2]){
     myout(N);
  }else{
    for(var i = 1; i <= N ;i++){
      var tmpS = s.slice(i);
      var tmpT = t.slice(0,N-i);
      myerr(tmpS + " " + tmpT);
      if(tmpS == tmpT){
        myout(N + i);
        return;
      }
    }
    myout(tmp.length);
  }
  
}