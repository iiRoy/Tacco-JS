function main(input){
    var max1 = 0;
    var max2 = 0;
    var once = [];

    var tmp = input.split('\n');
    var A = tmp[1].split(' ');

    var key;
    for(var i=0; i<A.length; i++){
        key = once.index(A[i]);
        if(key===-1){
            once.push(A[i]);
        }
        else{
            once.splice(key,1);
            if(max2<Number(A[i])){
                if(max1<Number(A[i])){
                    max2 = max1;
                    max1 = Number(A[i]);
                }else{
                    max2 = Number(A[i]);
                }
            }
        }
    }
    console.log(max2*max1);
    //console.log(A);
    //console.log(once);
    //console.log(max1, max2);
}

Array.prototype.index = (function (undefined)
{
    var f;

    return function (val, from)
    {
        if (from !== undefined) {
            if (from < 0) {
                f = from + this.length;

                if (f < 0)
                    return -1;
            }
            else {
                f = from;
            }
        }
        else {
            f = 0;
        }

        for (var i=f; i<this.length; i++) {
            if (this[i] === val)
                return i;
        }

        return -1;
    }
})();

main(require("fs").readFileSync("/dev/stdin", "utf8"));