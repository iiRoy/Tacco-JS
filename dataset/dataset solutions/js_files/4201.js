function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}
function Main(input) {
  input = myconv(input,6);
  var list = {
  	"K" : input.indexOf("K"),
    "I" : input.indexOf("I"),
    "H" : input.indexOf("H"),
    "B" : input.indexOf("B"),
    "R" : input.indexOf("R")
  };
  if(list["K"] == -1 || list["I"] == -1 ||list["H"] == -1 ||list["B"] == -1 ||list["R"] == -1){
     myout("NO");
    return;
     }
  if(input.length > 9){
     myout("NO");
    return;
  }
  if(list["K"] != list["I"]-1 || list["H"] < list["I"]){
     myout("NO");
    return;
  }
  if(list["H"] > list["B"] || list["B"] - list["H"] > 2){
     myout("NO");
    return;
  }
  if(list["B"] > list["R"] || list["R"] - list["B"] > 2){
     myout("NO");
    return;
  }
  var maeAcount = 0;
  for(var i = 0; i < input.length; i++){
    if(input[i] == "A"){
       maeAcount++;
    }else{
      break;
    }
  }
  if(maeAcount > 1){
     myout("NO");
    return;
  }
  var atoAcount = 0;
  for(var i = input.length-1; i >= 0; i--){
    if(input[i] == "A"){
       atoAcount++;
    }else{
      break;
    }
  }
  if(atoAcount > 1){
     myout("NO");
    return;
  }
  myout("YES");
}
Main(myin());