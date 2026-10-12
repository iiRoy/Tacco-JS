function main(input) {
    var n = input[0]-0;
    var a = 1,b=1;
    for(var i=1;i<=n;i++){
        var ta = input[i].split(" ")[0]-0;
        var tb = input[i].split(" ")[1]-0;
        if(ta >= a && tb >= b){
            a = ta;
            b = tb;
        }else if(a>=ta && b>=tb){
            var xa = Math.ceil(a/ta);
            var xb = Math.ceil(b/tb);
            if(xa>xb){
                a = xa*ta;
                b = xa*tb;
            }else{
                a = xb*ta;
                b = xb*tb;
            }
        }else if(a>=ta){
            var xa = Math.ceil(a/ta);
            a = xa*ta;
            b = xa*tb;
        }else{
            var xb = Math.ceil(b/tb);
            a = xb*ta;
            b = xb*tb;
        }
    }
    console.log(a+b);
    
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

