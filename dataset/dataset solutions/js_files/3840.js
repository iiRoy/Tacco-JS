let count = 0;
let string, K;
process.stdin.on('data', function(data) {
    count++;
    // console.log(data);

    switch (count) {
        case 1:
            string = data.toString().toLowerCase();
            break;
        case 2:
            K =Number(data);
            break;
    }
    // process.exit();
});

process.stdin.on('end', function() {
    main(string, Number(data));
});

function main(string, K) {
    const substringCounts = string.length;

    if(substringCounts < 1 || 5000 < substringCounts)
        process.exit();

    if(K < 1 || 5 < K)
        process.exit();

    let stacks = [];
    let _substr = '';
    for(let i = 0; i <= substringCounts; i++) {
        for(let j = i; j <= substringCounts; j++) {
            _substr = string.substring(i, j);
            if(!stacks.includes(_substr) && !_substr.includes('\n') && _substr !== '')
                stacks.push(string.substring(i, j));
        }
    }
    stacks.sort();
    console.log(stacks[K-1]);
    process.exit();
};