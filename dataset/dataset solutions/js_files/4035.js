var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var obj = {
  "list" : input,
  "index" : 0,
  "max" : input.length,
  "next" : function(){
    if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
    var returnObj = this.list[this.index];
    this.index++;
    return returnObj;
  },
  "hasNext" : function(){return (this.index < this.max);}
}
Main();
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
  var one = myconv(next(),4);
  var H = one[0];
  var W = one[1];
  var list = new Array(H);
  var visit = new Array(H);
  for(var i = 0; i < H; i++){
    list[i] = myconv(next(),6);
    visit[i] = new Array(W).fill(false);
  }
  visit[0][0] = true;
  var goal = 10000000;
  var queue = [[0,0,0]];
  while(queue.length > 0){
    var q = queue.shift();
    var y = q[0];
    var x = q[1];
    var count = q[2];
    if(y == H - 1 && x == W - 1){
       goal = Math.min(goal,count);
    }
    if(y != 0 && list[y - 1][x] == "." && !visit[y - 1][x]){
      visit[y - 1][x] = true;
      queue.push([y - 1, x, count + 1]);
    }
    if(x != 0 && list[y][x - 1] == "." && !visit[y][x - 1]){
      visit[y][x - 1] = true;
       queue.push([y, x - 1, count + 1]);
    }
    if(y != H - 1 && list[y + 1][x] == "." && !visit[y + 1][x]){
      visit[y + 1][x] = true;
       queue.push([y + 1, x, count + 1]);
    }
    if(x != W - 1 && list[y][x + 1] == "." && !visit[y][x + 1]){
      visit[y][x + 1] = true;
       queue.push([y, x + 1, count + 1]);
    }
  }
  //goal + 1以外の点はすべて変換化
  if(goal == 10000000){
     myout(-1);
  }else{
     var dot = 0;
     for(var i = 0; i < H; i++){
       for(var j = 0; j < W; j++){
         if(list[i][j] == "."){
            dot++;
         }
       }
     }
     dot -= (goal + 1);
    myout(dot);
  }
}
