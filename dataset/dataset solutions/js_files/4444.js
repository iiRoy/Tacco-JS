function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}//standard output
//[no]param
//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function Main(input) {
  input = myconv(input,3);
  var H = myconv(input[0],4)[0];
  var W = myconv(input[0],4)[1];
  var N = myconv(input[1],1);
  var list = myconv(input[2],4);
  
  var output = new Array(H);
  for(var i = 0; i < H; i++){
    output[i] = new Array(W);
  }
  
  var getNo = 1;
  for(var i = 0; i < H; i++){
    if(i % 2 == 0){
    for(var j = 0; j < W; j++){
      if(list[getNo-1] == 0){
        getNo++;
      }
      list[getNo-1]--;
      output[i][j] = getNo;
    }
  	}else{
    for(var j = W-1; j >= 0; j--){
      if(list[getNo-1] == 0){
        getNo++;
      }
      list[getNo-1]--;
      output[i][j] = getNo;
    }  
    }
  }
  for(var i = 0; i < H; i++){
    output[i] = output[i].join(" ");
  }
  myout(output.join("\n"));
}

Main(myin());
