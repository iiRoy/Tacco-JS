function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function Main(input) {
  input = myconv(input,3);
  input.shift();
  var output = [];
  for(var i = 0; i < input.length; i++){
    //a:最初の在庫 b:すぬけ君が買う個数 c:閾値 d:在庫が閾値以外の時に次の日のaに追加する個数
    var a = myconv(input[i],4)[0];
    var initA = myconv(input[i],4)[0];
    var b = myconv(input[i],4)[1];
    var c = myconv(input[i],4)[2];
    var d = myconv(input[i],4)[3];
	
    //a % b:すぬけ君がbだけ買うことができなくなる個数
    var noFlag = false;
    var count = 0;
    while(true){
      count++;
      if(a < b){
        noFlag = true;
        	break;
   		 }
      a = a % b;
      if(a <= c){
           a += d;
      }
      if(a == initA || count >= 10000000){
           break;
      }
    }
    if(noFlag){
       output.push("No");
    }else{
      output.push("Yes");
    }
  }
  myout(output.join("\n"));
}

Main(myin());
