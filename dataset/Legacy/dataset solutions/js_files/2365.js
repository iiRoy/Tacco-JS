function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function Main(input) {
  input = myconv(input,1);
  var genka = input / 1.08;
  var tmp1 = Math.floor(genka * 1.08);
  var tmp2 = Math.ceil(genka * 1.08);
  if(input == tmp1){
     myout(Math.ceil(genka));
  }else if(input == tmp2){
    myout(Math.floor(genka));
  }else{
    myout(":(");
  }
}

Main(myin());
