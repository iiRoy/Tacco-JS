var obj = init();
Main();

function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);}
function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}

function myin(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function init(){
  var inputFile = myin();
  var returnObj = {
    "list" : inputFile,
    "index" : 0,
    "max" : inputFile.length,
    "hasNext" : function(){
      return this.index < this.max;
    },
    "next" : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException";
      }
      var returnInput = this.list[this.index++];
      return returnInput;
    }
  };
  return returnObj;
}

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
  var one = nextIntArray();
  var N = one[0];
  var MA = one[1];
  var MB = one[2];
  var list = [];

  for(var i = 0; i < N; i++){
    list.push(nextIntArray());
  }

  var maxValue = 151;
  var dp = new Array(N + 1);

  for(var i = 0; i <= N; i++){
    dp[i] = new Array(maxValue);
    for(var j = 0; j < maxValue; j++){
      dp[i][j] = new Array(maxValue);
      for(var k = 0; k < maxValue; k++){
        dp[i][j][k] = null;
      }
    }
  }

  dp[0][0][0] = 0;

  for(var i = 1; i <= N; i++){
    var item = list[i - 1];

    for(var j = 0; j < maxValue; j++){
      for(var k = 0; k < maxValue; k++){
        if(dp[i - 1][j][k] != null){
          if(dp[i][j][k] == null){
            dp[i][j][k] = dp[i - 1][j][k];
          }else{
            dp[i][j][k] = Math.min(dp[i][j][k], dp[i - 1][j][k]);
          }
        }
      }
    }

    for(var j = 0; j < maxValue; j++){
      for(var k = 0; k < maxValue; k++){
        var before = dp[i - 1][j][k];

        if(before != null){
          var nextA = j + item[0];
          var nextB = k + item[1];

          if(nextA < maxValue && nextB < maxValue){
            var nextCost = before + item[2];

            if(dp[i][nextA][nextB] == null){
              dp[i][nextA][nextB] = nextCost;
            }else if(nextCost < dp[i][nextA][nextB]){
              dp[i][nextA][nextB] = nextCost;
            }
          }
        }
      }
    }
  }

  var count = 1;
  var output = 10000;

  while(count * MA < maxValue && count * MB < maxValue){
    var getMA = MA * count;
    var getMB = MB * count;
    var candidate = dp[N][getMA][getMB];

    if(candidate != null){
      output = Math.min(output, candidate);
    }

    count++;
  }

  if(output === 10000){
    myout(-1);
  }else{
    myout(output);
  }
}