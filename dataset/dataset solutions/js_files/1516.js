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
  var N = one[0];
  var K = one[1];
  var mod = 998244353;
  var dp = new Array(N).fill(0);
  var ruiseki = new Array(N).fill(0);
  dp[0] = 1;
  ruiseki[0] = 1;
  var list = new Array(K);
  for(var i = 0; i < K; i++){
    var tmp = nextIntArray();
    list[i] = {
      L : tmp[0],
      R : tmp[1]
    };
  }
  for(var i = 1; i < N; i++){
    for(var j = 0; j < K; j++){
      var check =  list[j];
      if(i - check.L < 0){
        continue;
      }
      if(check.L == check.R){
        dp[i] += dp[i - check.L];
      }else if(i - check.R - 1 < 0){
        dp[i] += ruiseki[i - check.L];
      }else{
        dp[i] += ruiseki[i - check.L] - ruiseki[i - check.R - 1];
      }
      if(dp[i] < 0){
        dp[i] += mod;
      }
      dp[i] %= mod;
    }
    ruiseki[i] = dp[i] + ruiseki[i - 1];
    ruiseki[i] %= mod;
  }
  myout(dp[N - 1]);
}
