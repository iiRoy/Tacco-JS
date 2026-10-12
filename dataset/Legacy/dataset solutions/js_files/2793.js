//Don't have to see. start------------------------------------------
var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = Date.now();
  Main();
  var end = Date.now() - start;
  myerr("time : " + end + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

//Don't have to see. end------------------------------------------
function Main(){
  var one = nextIntArray();
  var N = one[0];
  var M = one[1];
  var list = new Array(N);
  for(var i = 0; i < N; i++){
    list[i] = {
      child : [],
      parent : new Set(),
      access : false,
      depth : 0
    };
  }
  for(var i = 0; i < M; i++){
    var tmp = nextIntArray();
    list[tmp[0] - 1].child.push(tmp[1] - 1);
  }
  for(var i = 0; i < N; i++){
    dfs(i, i, 0);
  }
  var tmp = nextIntArray();
  var s = tmp[0] - 1;
  var t = tmp[1] - 1;
  var queue = [t];
  list[t].access = true;
  var output = 0;
  while(queue.length > 0){
    var now = queue.shift();
    if(now == s){
      output = list[now].depth;
      break;
    }
    var child = Array.from(list[now].parent);
    for(var i = 0; i < child.length; i++){
      if(!list[child[i]].access){
        list[child[i]].access = true;
        list[child[i]].depth = list[now].depth + 1;
        queue.push(child[i]);
      }
    }
  }
  //myerr(list);
  if(output == 0){
    myout(-1);
  }else{
    myout(output);
  }
  

  function dfs(root, now, depth){
    if(depth == 3){
      list[now].parent.add(root);
      return;
    }
    var child = list[now].child;
    for(var j = 0; j < child.length; j++){
      dfs(root, child[j], depth + 1);
    }
    return;
  }
}