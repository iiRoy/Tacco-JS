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
      var N = parseInt(lines[0])
      var ans = 0

      for (var i=0;i<=N;i++){
        var test = i*i
        if(test <= N){
            ans = test
        }
      }

    console.log(ans)
      
//      console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1])  )
    // ToDo end

    });


})();

