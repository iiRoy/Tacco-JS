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
  var N = one[0];
  var M = one[1];
  var K = one[2];
  var list = new Array(N);
  var i;
  for(i = 0; i < N; i++){
    list[i] = {
    	"friend" : [],
        "group" : null
    };
  }
  for(i = 0; i < M; i++){
    var tmp = myconv(next(),4);
    list[tmp[0] - 1]["friend"].push(tmp[1] - 1);
    list[tmp[1] - 1]["friend"].push(tmp[0] - 1);
  }
  var group = [];
  for(i = 0; i < N; i++){
    bfs(i);
  }
  //myerr(list);
  function bfs(index){
    if(list[index]["group"] != null){
       return;
    }
    group.push(new Set());
  	var queue = [list[index]];
    while(queue.length > 0){
        var tmp = queue.shift();
      	if(tmp["group"] != null){
           continue;
        }
      	tmp["group"] = group.length - 1;
        for(var j = 0; j < tmp["friend"].length; j++){
          queue.push(list[tmp["friend"][j]]);
        }
    }
  }
  for(i = 0; i < N; i++){
    group[list[i]["group"]].add(i);
  }
  //myerr(group);
  var output = new Array(N);
  for(i = 0; i < N; i++){
    output[i] = group[list[i]["group"]].size - 1 - list[i]["friend"].length;
  }
  for(i = 0; i < K; i++){
    var ng = myconv(next(),4);
    ng[0]--;
    ng[1]--;
    if(list[ng[0]]["group"] != list[ng[1]]["group"]){
       continue;
    }
    output[ng[0]]--;
    output[ng[1]]--;
  }
  myout(myconv(output,8));
}