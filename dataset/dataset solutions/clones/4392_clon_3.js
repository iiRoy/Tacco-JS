var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var obj = {
  "list" : input,
  "index" : 0,
  "max" : input.length,
  "next" : function(){
    if(!this.hasNext()){
      throw "NoSuchElementException";
    }
    var returnObj = this.list[this.index++];
    return returnObj;
  },
  "hasNext" : function(){
    return this.index < this.max;
  }
};

Main();

function next(){return obj.next();}
function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);}
function nextCharArray(){return myconv(next(),6);}
function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);}
function myerr(t){console.error(t);}

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
  var price = nextIntArray();
  var Q = price[0];
  var H = price[1];
  var S = price[2];
  var D = price[3];
  var N = nextInt();

  var twoLiterPrices = [];
  twoLiterPrices.push(Q * 8);
  twoLiterPrices.push(H * 4);
  twoLiterPrices.push(S * 2);
  twoLiterPrices.push(D);

  var output = 0;
  var bestTwo = Math.min.apply(null, twoLiterPrices);
  var pairCount = Math.floor(N / 2);

  output += bestTwo * pairCount;

  if(N % 2 !== 0){
    var oneLiterPrices = [Q * 4, H * 2, S];
    var bestOne = Math.min.apply(null, oneLiterPrices);
    output = output + bestOne;
  }else{
    output = output + 0;
  }

  myout(output);
}