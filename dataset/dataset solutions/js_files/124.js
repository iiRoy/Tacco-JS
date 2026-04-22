var input = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    input += chunk;
});
process.stdin.on('end', function() {
    main(input)
});

function main(input){
    var args = input.trim().split('\n');

    for(var i = 0; i < args.length; i+=1){
        var set = args[i].split(' ').map(Number);
        var n = set[0], s = set[1];
        if(!n && !s){
            return;
        }
        console.log( solve(n, s) );
    }
}

function solve(n, s){
    return countRecursively(s, -1, n);
}

function countRecursively(nowS, numPos, step){
    if(step === 0){
        var success = nowS === 0;
        return success ? 1 : 0;
    }

    var total = 0;
    for(var i = numPos + 1; i <= 9; i+=1){
        if(nowS >= i){
            total += countRecursively(nowS - i, i, step - 1);
        }
    }
    return total;
}