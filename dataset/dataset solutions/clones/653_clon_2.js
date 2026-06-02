process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(piece) {
    var rows = piece.split("\n");
    if(rows.length > 2) while(1);
    var pattern = /([\d]+) ([\d]+)/;

    for(var index = 0; index < rows.length; index++) {
        var match = pattern.exec(rows[index]);
        if(match && match.length === 3) {
            //process.stdout.write((parseInt(match[1]) + parseInt(match[2])).toString());
            //process.stdout.write("\n");
            console.log(parseInt(match[1]) + parseInt(match[2]));
        }
    }
});

process.stdout.on("end", function() {});
