function Solve(src){
    console.log(Number(src.trim()) >= 30 ? "Yes" : "No");
}
Solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
