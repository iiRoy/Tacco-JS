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
  myerr("time : " + (end) + "ms");
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
  var A = one[0] * 100;
  var B = one[1] * 100;
  var C = one[2];
  var D = one[3];
  var E = one[4];
  var F = one[5];
  var max = 0;//濃度
  var output = [0, 0];
  var waterSet = new Set();
  var soltSet = new Set();
  var lmax = 3000;
  //水の組み合わせ
  //砂糖の組み合わせ
  for(var i = 0; i <= lmax; i++){
    for(var j = 0; j <= lmax; j++){
      var water = A * i + B * j;
      var solt = C * i + D * j;
      if(water <= F){
        waterSet.add(water);
      }
      if(solt <= F){
        soltSet.add(solt);
      }
    }
  }
  
  var waterList = Array.from(waterSet);
  var soltList = Array.from(soltSet);
  for(var i = 0; i < waterList.length; i++){
    for(var j = 0; j < soltList.length; j++){
      var water = waterList[i];
      var solt = soltList[j];
      if(water + solt <= F && check(water, solt, E)){
        var sum = water + solt;
        if(sum == 0){continue;}
        var noudo = solt * 100 / sum;
        if(noudo > max){
          max = noudo;
          output[0] = sum;
          output[1] = solt;
        }
      }
    }
  }
  
  myout(myconv(output, 8));
  
  
}
function check(water, solt, E){
      var single = water / 100 * E;
      return single >= solt;     
}