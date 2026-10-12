function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function Main(input) {
  input = myconv(input,4).sort(function(a,b){return a-b;});
  //3つとも偶奇が一致しているか確認
  //一致しないときは必ず2つは偶奇が一致する。この二つを+1する
  //「最大から足りない分/2回」足せば数値も一致する
  var A = input[0];
  var B = input[1];
  var C = input[2];
  var output = 0;
  if(!(A % 2 == B % 2 && A % 2 == C % 2 && C % 2 == B % 2)){
     if(A % 2 == B % 2){
        A++;
       B++;
     }else if(A % 2 == C % 2){
       A++;
       C++;
     }else if(C % 2 == B % 2){
       B++;
       C++;
     }
    output++;
  }
  output += (Math.max.apply(null,[A,B,C]) - A)/2;
  output += (Math.max.apply(null,[A,B,C]) - B)/2;
  output += (Math.max.apply(null,[A,B,C]) - C)/2;
  myout(output);
}

Main(myin());
