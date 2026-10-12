(function() {
    'use strict';

    var lines = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(line) {
      lines.push(line);
    });
    process.stdin.on('end', function() {
      //lines.forEach(function(line) {
        //var tokens = line.split(' ').map(Number);
        //    console.log(tokens[0] + ' ' + tokens[1]);
      //}
      //)
      ;

    // ToDo start
      var inLines = lines[0].split(" ")
      var N = parseInt(inLines[0]);
      var Z = parseInt(inLines[1]);
      var W = parseInt(inLines[2]);
      var A = lines[1].split(" ")
      
      var X;
      var Y;

      for(var i=0;i<N;i++){
          A[i] = parseInt(A[i])
      }

      // 最後のカードは、必ずXかYの手札になる！
      // 実は最後の2枚で全部決まってる？
      // X が最後のカードをとる場合。
      X = A[N -1 ];
      Y = W;
      var score1 = Math.abs(X-Y);
//      console.log(score1)
      // Y が最後のカードをとる場合。
      X = A[N -2 ];
      Y = A[N -1 ];
      var score2 = Math.abs(X-Y);
//      console.log(score2)
      
      var ans = Math.max(score1,score2);
      console.log(ans)
//      for( var i=0;i<A.length;i++){
//          var getX = A[i]
//          var getY = Math.max(A.slice(i+1,A.length-1))
//      }


      // X < Y の場合の最適値

//      console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1])  )
    // ToDo end

    });


})();

