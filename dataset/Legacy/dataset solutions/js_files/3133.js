function main(input) {
    var i, j, A, ans=0
    var arg = input.split("\n")[0].split(" ")
    A=new Array(arg[1])
    for (i=0;i<arg[0];i++){
        A[i] = input.split("\n")[i+1].split(" ")
    }
    A.sort(function(a,b){return(a[0] - b[0])})
    i=0
    j=0
    while(j<arg[1]){
        ans += Number(A[i][0])
        A[i][1]--
        j++
        if (A[i][1]<=0) i++
    }
    console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));