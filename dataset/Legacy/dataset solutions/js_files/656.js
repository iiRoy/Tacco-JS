process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function(chunk) {
    var data = chunk.split("\n");
    var reg = /([\d]+) ([\d]+)/;

    for(var i = 0; i < data.length; i++) {
        var result = reg.exec(data[i]);
        if(result && result.length === 3) {
            process.stdout.write((parseInt(result[1]) + parseInt(result[2])).toString());
            process.stdout.write("\n");
        }
    }
});