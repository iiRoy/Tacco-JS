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
//不明値、異常時:引数そのまま返す
//1:数値へ変換 2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字に分割 7:1文字に分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main() {
  var one = myconv(next(),4);
  var H = one[0];
  var W = one[1];
  var list = new Array(H);
  for(var i = 0; i < H; i++){
    list[i] = myconv(next(),6);
  }
  //ゴールからスタートに戻ってみる
  //たどったところは変える
  var y = H - 1;
  var x = W - 1;
  while(y >= 0 && x >= 0){
    myerr(x + " " + y);
    list[y][x] = "k";
    if(x == 0 && y == 0){
       if(list[y][x + 1] != "#" && list[y + 1][x] != "#"){
          break;
       }else{
         myout("Impossible");
      return;
       }
    }
    if(x == 0){
       if(list[y - 1][x] == "#" && list[y][x + 1] != "#" && list[y + 1][x] != "#"){
          y--;
         continue;
       }else{
         myout("Impossible");
      return;
       }
    }
    if(y == 0){
       if(list[y][x - 1] == "#" && list[y + 1][x] != "#" && list[y][x + 1] != "#"){
          x--;
         continue;
       }else{
         myout("Impossible");
      return;
       }
    }
    if(y == H - 1 && x == W - 1){
       if(list[y - 1][x] == "#"){
           y--;
       }else{
           x--;
       }
      continue;
    }
    if(y == H - 1 || x == W - 1){
       if((list[y - 1][x] == "#" && list[y][x - 1] == "." ||
      list[y][x - 1] == "#" && list[y - 1][x] == ".")){
          if(list[y - 1][x] == "#"){
           y--;
         }else{
           x--;
         }
         continue;
       }else{
         myout("Impossible");
        return;
       }
    }
    
    if(list[y + 1][x] == "k"){
       if((list[y - 1][x] == "#" && list[y][x - 1] == "." ||
      list[y][x - 1] == "#" && list[y - 1][x] == ".") && list[y][x + 1] != "#"){
         if(list[y - 1][x] == "#"){
           y--;
         }else{
           x--;
         }  
       }else{
         myout("Impossible");
      return;
       }
    }else{
      if((list[y - 1][x] == "#" && list[y][x - 1] == "." ||
      list[y][x - 1] == "#" && list[y - 1][x] == ".") && list[y + 1][x] != "#"){
       if(list[y - 1][x] == "#"){
          y--;
       }else{
          x--;
       }      
      continue;
    }else{
      myout("Impossible");
      return;
    }
    }
    
  }
  myout("Possible");
}