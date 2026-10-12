process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(source) {
   var lines = source.split("\n");

   while (lines[0] != 0) {
      var group = lines.splice(0, 5);
      var answer, kinds = [];

      group.forEach(function(value) {
         if (kinds.indexOf(value) < 0) kinds.push(value);
      });

      if (kinds.length == 3 || kinds.length == 1) {
         answer = [3, 3, 3];
      } else {
         if (kinds.indexOf("1") < 0) answer = [0, 1, 2];
         else if (kinds.indexOf("2") < 0) answer = [2, 0, 1];
         else if (kinds.indexOf("3") < 0) answer = [1, 2, 0];
      }

      group.forEach(function(value) {
         console.log(answer[value - 1]);
      });
   }
});