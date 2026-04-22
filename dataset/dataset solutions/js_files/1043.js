process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
    var xs = chunk.toString().trim().split('\n').slice(1).map(function(x){ return x.split(' '); });
    var ys = {};
    xs.forEach(function(x){
        if(x[0] === 'insert'){
            ys[x[1]] = true;
        }else if(x[0] === 'find'){
            console.log(x[1] in ys ? 'yes' : 'no');
        }
    });
});
