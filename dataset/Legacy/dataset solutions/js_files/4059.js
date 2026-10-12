function Main(input) {
    var menbers = {}
    var res = true;
    var arr = input.split(/\n/).slice(1);
    var rest = [];
    while(arr.length !== 0){
        arr.forEach((line,index) => {
            var fn = line.split(/\s/).map(str => {
                return Number(str);
            });
            if (menbers[fn[0]] !== undefined && menbers[fn[1]] !== undefined) {
                res = (menbers[fn[1]] - menbers[fn[0]]) === fn[2];
            } else if (menbers[fn[0]] !== undefined) {
                menbers[fn[1]] = menbers[fn[0]] + fn[2];
            } else if (menbers[fn[1]] !== undefined) {
                menbers[fn[0]] = menbers[fn[1]] - fn[2];
            } else if(index === 0){
                let start = 0;
                while(menbers[start]!==undefined){
                    start++;
                }
                menbers[fn[0]] = start;
                menbers[fn[1]] = menbers[fn[0]] + fn[2];
            } else {
                rest.push(line);
            }
        });
        arr = rest;
    }
    console.log(res ? 'Yes' : 'No');
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));