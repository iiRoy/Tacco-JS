//Don't have to see. start------------------------------------------
var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n↑入力 ↓出力');
  Main();
});
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  return {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

//Don't have to see. end------------------------------------------
function Main(){
  var one = nextIntArray();
  var H = one[0];
  var W = one[1];
  var list = new Array(H);
  for(var i = 0; i < H; i++){
    list[i] = nextIntArray();
  }
  for(var i = 0; i < H; i++){
    var tmp = nextIntArray();
    for(var j = 0; j < W; j++){
      list[i][j] = Math.abs(list[i][j] - tmp[j]);
    }
  }
  var max = 90;
  var dp = new Array(H);
  for(var i = 0; i < H; i++){
    dp[i] = new Array(W);
    for(var j = 0; j < W; j++){
      dp[i][j] = new Array(max).fill(false);
    }
  }
  
  dp[0][0][list[0][0]] = true;
  for(var i = 0; i < H; i++){
    for(var j = 0; j < W; j++){
      if(i == 0 && j == 0){continue;}
      if(i == 0){
        for(var k = 0; k < max; k++){
          if(dp[i][j - 1][k]){
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
        }
      }else if(j == 0){
        for(var k = 0; k < max; k++){
          if(dp[i - 1][j][k]){
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
        }
      }else{
        for(var k = 0; k < max; k++){
          if(dp[i - 1][j][k]){
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
          if(dp[i][j - 1][k]){
            dp[i][j][Math.abs(k + list[i][j])] = true;
            dp[i][j][Math.abs(k - list[i][j])] = true;
          }
        }
      }
    }
  }
  for(var i = 0; i < max; i++){
    if(dp[H - 1][W - 1][i]){
      myout(i);
      return;
    }
  }
}
