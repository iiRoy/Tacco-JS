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
      //var line2token = lines[1].split(" ")
      console.log( Math.pow(parseInt(lines[0]),2) - parseInt(lines[1])  )
    // ToDo end

    });


})();

