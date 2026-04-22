function main(input) {
    var n = input[0].split("");
    var ans = 0;
    for(var i=1;i<n.length;i++){
        if(n[i-1] != n[i]) ans++;
    }
    console.log(ans);
    
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
