var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var obj;
var inLine = [];

read.on('line', function(line){
  inLine[inLine.length] = line;
});

read.on('close', function(){
  obj = init(inLine);
  Main();
});

function makeClone(obj){
  return JSON.parse(JSON.stringify(obj));
}

function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);}
function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}

function init(input){
  var returnObj = {
    list : input,
    index : 0,
    max : input.length,
    hasNext : function(){
      return this.index < this.max;
    },
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException";
      }
      var returnInput = this.list[this.index];
      this.index++;
      return returnInput;
    }
  };
  return returnObj;
}

function myout(s){
  console.log(s);
}

function myerr(s){
  console.error("debug:" + require("util").inspect(s,false,null));
}

function myconv(i,no){
  try{
    switch(no){
      case 1:
        return parseInt(i,10);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(function(a){return Number(a);});
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
	var N = nextInt();
	var list = [];

	for(var i = 0; i < N; i++){
		var a = nextInt();

		if(list.length === 0){
			list.push(a);
		}else{
			var index = binarySearch(list,a);

			if(index >= list.length){
				list.push(a);
			}else{
				list.splice(index,1,a);
			}
		}
	}

	myout(list.length);
}

function binarySearch(list,search){
  var ng = -1;
  var ok = list.length;
  var center = 0;

  while(ok - ng > 1){
    center = ((ok + ng) / 2) | 0;

    if(list[center] < search){
       ok = center;
    }else{
       ng = center;
    }
  }

  return ok;
}