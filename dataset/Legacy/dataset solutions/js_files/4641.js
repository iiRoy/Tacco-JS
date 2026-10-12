process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
    var lines = chunk.toString().split(' ');
    var first = lines[0];
    var second = lines[1];
    var third = lines[2];
    
    var dif_1to2 = second - first;
    var dif_2to3 = third - second;
    
    if(
        dif_1to2 === dif_2to3)
        {
            console.log("YES")
        }else{
            console.log("NO")
        }
        
//    console.log(lines);
});