var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var obj = {
  "list": input,
  "index": 0,
  "max": input.length,
  "hasNext": function(){
    return this.index < this.max;
  },
  "next": function(){
    if(!this.hasNext()){
      throw "NoSuchElementException";
    }
    var returnObj = this.list[this.index++];
    return returnObj;
  }
};

Main();

function next(){return obj.next();}
function nextInt(){return myconv(next(), 1);}
function nextStrArray(){return myconv(next(), 2);}
function nextIntArray(){return myconv(next(), 4);}
function nextCharArray(){return myconv(next(), 6);}
function hasNext(){return obj.hasNext();}
function myout(t){process.stdout.write(String(t) + "\n");}
function myerr(t){console.error(t);}

function myconv(i, no){
  try{
    switch(no){
      case 1:
        return parseInt(i, 10);
      case 2:
        return i.trim().split(" ");
      case 4:
        return i.trim().split(" ").map(function(a){return Number(a);});
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(function(a){return Number(a);});
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  }catch(e){
    return i;
  }
}

function Main(){
  var one = nextIntArray();
  var A = one[0];
  var B = one[1];
  var M = one[2];

  var alist = nextIntArray();
  var blist = nextIntArray();

  var minA = Math.min.apply(null, alist);
  var minB = Math.min.apply(null, blist);
  var min = minA + minB;

  for(var i = 0; i < M && hasNext(); i++){
    var tmp = nextIntArray();
    var aIndex = tmp[0] - 1;
    var bIndex = tmp[1] - 1;
    var tmpMin = alist[aIndex] + blist[bIndex] - tmp[2];

    if(tmpMin < min){
      min = tmpMin;
    }
  }

  myout(min);
}