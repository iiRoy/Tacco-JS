function main(input) {
    var n = input[0]-0;
    var alist = [];
    var blist = [];
    for(var i=1;i<=n;i++){
        alist.push(input[i].split(" ").map(v=>v-0));
        blist.push(input[i+n].split(" ").map(v=>v-0));
    }
    alist.sort((a,b)=>a[0]>a[1]?(a[1]-b[1]):(a[0]-b[0]));
    blist.sort((a,b)=>a[0]>a[1]?(b[1]-a[1]):(a[0]-b[0]));
    
    var aidx=bidx=bmax=0;
    var ans = 0;
    while(aidx<n && bidx<n){
        var a = alist[aidx];
        var b = blist[bidx];
        if(a[0]<b[0] && a[1]<b[1]){
            ans++;
            aidx++;
            bidx++;
        }else{
            bidx++;
        }
    }
    console.log(ans);
    

}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));