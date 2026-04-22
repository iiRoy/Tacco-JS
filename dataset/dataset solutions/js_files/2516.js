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
  var N = nextInt();
  var list = new Array(N);
  for(var i = 0; i < N; i++){
    list[i] = {
      child : [],
      access : false,
      depth : 1
    };
  }
  for(var i = 0; i < N; i++){
    var tmp = nextCharArray();
    for(var j = 0; j < N; j++){
      if(i != j && tmp[j] == "1"){
        list[i].child.push(j);
      }
    }
  }
  
  var output = -1;
  var isOK = false;
  for(var i = 0; i < N; i++){
    if(list[i].child.length == 1){
      isOK = true;
      var queue = [i];
      list[i].access = true;
      while(queue.length > 0){
        var now = queue.shift();
        var child = list[now].child;
        for(var k = 0; k < child.length; k++){
          if(!list[child[k]].access){
            list[child[k]].access = true;
            list[child[k]].depth = list[now].depth + 1;
            output = Math.max(output, list[now].depth + 1);
            queue.push(child[k]);
          }
        }
      }
      break;
    }
  }
  
  if(!isOK){
    myout(output);
    return;
  }
  for(var i = 0; i < N - 1; i++){
    for(var j = i + 1; j < N; j++){
      if(list[i].depth == list[j].depth && (list[i].child.indexOf(j) != -1 || list[j].child.indexOf(i) != -1)){
        myerr({i,j});
        output = -1;
        break;
      }
    }
  }
  myout(output);

}
