function main(input) {
    var a = input[0];
    var b = input[1];
    var ans = false;
    if(a.length != b.length) ans = false;
    else{
        start: for(var i=0;i<a.length;i++){
            for(var j=0;j<b.length;j++){
                if(a[(i+j)%a.length] != b[j])continue start;
            }
            ans = true;
            break;
        }
    }
    
    console.log(ans?"Yes":"No");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
