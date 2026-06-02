(function() {
    "use strict";

    var inputRows = [];
    require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    }).on("line", function(row) {
      inputRows.push(row);
    });
    process.stdin.on("end", function() {
      //inputRows.forEach(function(row) {
        //var values = row.split(" ").map(Number);
        //    console.log(values[0] + " " + values[1]);
      //}
      //)
      ;

    // ToDo start
      //var row2values = inputRows[1].split(" ")
      console.log( Math.pow(parseInt(inputRows[0]),2) - parseInt(inputRows[1])  )
    // ToDo end

    });


})();
