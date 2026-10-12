function main(input) {
    var N = input[0].split(" ")[0]-0;
    var X = input[0].split(" ")[1]-0;
    var list = [];
    var sum = 0;
    for(var i=1;i<=N;i++) {sum += (input[i]-0); list.push(input[i]-0);}
    list.sort((a,b)=>a-b);
    X-=sum;
    console.log(N+Math.floor(X/list[0]));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
