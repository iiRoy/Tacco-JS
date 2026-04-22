
function Main(input) {
    const string = input[0].toString();
        const K = parseInt(input[1]);
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
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
