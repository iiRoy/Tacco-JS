function main(arg) {
    var temp = arg.split("\n");
    var L = parseInt(temp[0].split(" ")[0]);
    var N = parseInt(temp[0].split(" ")[1]);
    temp.shift();
    var X = temp;
    var now = 0;
    var total = 0;
    
    for(var i=0; i<N; i++) {
        var left = parseInt(X[0]);
        var right = parseInt(X[X.length - 1]);
        var forward = left - now);
        var back = (L - right) + now;
        
        console.log("now:" + now);
        console.log("total:" + total);

        if(forward > back) {
            total = total + (forward);
            X.shift();
            now = left;
            
        } else {
            total = total + (back);
            X.pop();
            now = right;

        }

    }
    
    console.log(total);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));