process.stdin.resume();
process.stdin.setEncoding('utf8');

var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  lines.push(line);
});
reader.on('close', () => {
    let [N, K] = lines[0].split(" ").map(v=>BigInt(v));
    const map = {};
    let ans = N;
    while(!map[N]){
        const a = N%K;
        map[a] = true;
        ans = ans>a?a:ans;
        N = K>a?K-a:a-K;
        if(ans==0)break;
    }
    console.log(ans.toString());
    
});
