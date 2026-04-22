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
    var args = input.split('\n');
    args = args.map(function(pair){
        pair = pair.split(' ')
                   .map(function(n){
                       return parseInt(n);
                    });
        return pair;
    })

    args.forEach(function(pair){
        console.log(pair[0] + pair[1]);
    })
}