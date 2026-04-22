function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var M = parseInt(input[0].split(" ")[1]);
  var C = parseInt(input[0].split(" ")[2]);
  var B = input[1].split(" ").map(x => ~~x);
  var A = [];
  for(var i=0; i < N; i++){ A[i] = input[i+2].split(" ").map(x => ~~x);}

  var AtCoder = function(){};

  AtCoder.prototype = {
    procedure: function(){
      var numCorrect=0;
      for(var j=0;j<N;j++){
        var sum=0;
        sum = sum+C;
        for(var i=0; i<M;i++){
          debugger;
          sum = sum+A[j][i]*B[i];
        }
        if(sum > 0) numCorrect++;
      }
      return numCorrect;
    }
  }
  var atcoder = new AtCoder();
  console.log(atcoder.procedure());
}

var input=Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// var input=`5 2 -4
// -2 5
// 100 41
// 100 40
// -3 0
// -6 -2
// 18 -13`
// Main(input);
