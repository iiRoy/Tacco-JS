process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
    var aaa = chunk.toString();
    var line = aaa.split("\n")
    line.pop();
    for(var i in line){
        var l = line[i].split(" ")
        var num1 = new Number (l[0]);
        var num2 = new Number(l[1]);
        var num = num1+num2
        //num.toString();
        console.log(String(num).length);
    }
});