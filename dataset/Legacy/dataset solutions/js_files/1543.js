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
function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);}//半角スペース分割
function nextIntArray(){return myconv(next(),4);}//半角スペース + 数値化
function nextCharArray(){return myconv(next(),6);}//1文字分割
function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);}//標準出力
function myerr(t){console.error(t);}//標準エラー出力
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
  var unionFind = {
  "list" : null,
  //全てのインデックスは「-X(親、絶対値はグループの大きさ)」「自分が属する親(≒根)」のいずれかを持つ。
  //最初はみんなグループの大きさ1の親
  "init" : function(n){
    this.list = new Array(n).fill(-1);
  },
  //同じ親を持つか
  "isSame" : function(mae, ato){
    return this.getRootIndex(mae) == this.getRootIndex(ato);
  },
  //自身の親インデックスをたどって根っこに着く
  //親にたどり終えたら子に帰っていくついでに、子たちに「共通の親を持っている」ことを知らせる
  "getRootIndex" : function(index){
    if(this.list[index] < 0){
       return index;
    }else{
       this.list[index] = this.getRootIndex(this.list[index]);
      return this.list[index];
    }
  },
  //異なる親同士のまとまりを一つにする（同じ親ならスルー）
  //小さいグループの親が大きいグループの親の直下に着く
  //グループの大きさも更新する
  "doUnion" : function(mae, ato){
    var maeRoot = this.getRootIndex(mae);
    var atoRoot = this.getRootIndex(ato);
    if(!this.isSame(maeRoot, atoRoot)){
       if(maeRoot >= atoRoot){
          this.list[maeRoot] += this.list[atoRoot];
         this.list[atoRoot] = maeRoot;
       }else{
          this.list[atoRoot] += this.list[maeRoot];
         this.list[maeRoot] = atoRoot;
       }
    }
  },
  //「-X(親、絶対値はグループの大きさ)」
  //なので、インデックスを指定→親を知る→親の持つグループの大きさがわかる。
  //ただしマイナス値なので、掛け算して返す。
  "getSize" : function(index){
    return -this.list[this.getRootIndex(index)];
  }
}
  var one = nextIntArray();
  var N = one[0];
  var Q = one[1];
  unionFind.init(N);
  var output = [];
  for(var i = 0; i < Q; i++){
    var query = nextIntArray();
    if(query[0] == 0){
       unionFind.doUnion(query[1],query[2]);
    }else{
       if(unionFind.isSame(query[1],query[2])){
          output.push("Yes");
       }else{
          output.push("No");
       }
    }
  }
  myout(myconv(output,9));
}
