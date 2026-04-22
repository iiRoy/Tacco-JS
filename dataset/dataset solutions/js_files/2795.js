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
  var newList = new Array(N);
  var used = new Set();
  for(var i = 0; i < N; i++){
    list[i] = {
      child : [],
    };
    newList[i] = {
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
  list = null;
  var tmp = nextIntArray();
  var s = tmp[0] - 1;
  var t = tmp[1] - 1;
  var maeIndex = 0;
  var atoIndex = 1;
  var queue = new Array(100007);
  queue[0] = t;
  newList[t].access = true;
  var output = -1;
  while(maeIndex != atoIndex){
    var now = queue[maeIndex];
    maeIndex++;
    if(now == s){
      output = newList[now].depth;
      break;
    }
    var child = Array.from(newList[now].parent);
    for(var i = 0; i < child.length; i++){
      if(!newList[child[i]].access){
        newList[child[i]].access = true;
        newList[child[i]].depth = newList[now].depth + 1;
        queue[atoIndex] = child[i];
        atoIndex++;
      }
    }
  }
  //myerr(list);
  //myerr(newList);
  myout(output);
  

  function dfs(root, now, depth){
    if(used.has(now + ":" + depth)){
      return;
    }
    used.add(now + ":" + depth);
    if(depth == 3){
      newList[now].parent.add(root);
      used.add(root.toString() + ":" + now.toString());
      return;
    }
    var child = list[now].child;
    for(var j = 0; j < child.length; j++){
      dfs(root, child[j], depth + 1);
    }
    return;
  }
}