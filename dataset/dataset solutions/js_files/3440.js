function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
  input = myconv(input,3);
  var N = myconv(input[0],1);
  var list = myconv(input[1],4);
  var ave = getAverage(list);
  var output = 0;
  var lastThumb = 101;
  for(var i = 0; i < N; i++){
    if(lastThumb > Math.abs(list[i] - ave)){
       lastThumb = Math.abs(list[i] - ave);
      output = i;
    }
  }
  myout(output);
}
function getAverage(list){
	var sum = 0;
    for(var i = 0; i < list.length; i++){
      sum += list[i];
    }
    return sum / list.length;
}
Main(myin());