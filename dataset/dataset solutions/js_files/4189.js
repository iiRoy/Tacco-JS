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

      var keta = (inLines+'').length
      var insum = 0;

      for (var i=0;i<keta;i++){
        insum+=parseInt((inLines+'')[i])
      }

      var amari = inLines % insum;
//      console.log(insum)
      if (amari == 0) {
          console.log("Yes")
      } else {
        console.log("No")
        
      }
      
//      console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1])  )
    // ToDo end

    });


})();

