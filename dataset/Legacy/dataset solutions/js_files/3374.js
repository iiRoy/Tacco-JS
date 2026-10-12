function main(arg) {
    var N = parseInt(arg.split(" ")[0]);
    var P = parseInt(arg.split(" ")[1]);
    
    var factrizeNum = getAllFactorsFor(P);
    factrizeNum.push(P);
    var map = [];
    var max = 1;

    for(var i=0; i<factrizeNum.length; i++) {
        var temp = map.filter(n => n == factrizeNum[i]).length +1;
        if( temp >= N) {
            if ( factrizeNum[i] > max ) {
                max = factrizeNum[i];
            }
        }
    }
    console.log(max);

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function getAllFactorsFor(remainder) {
    var factors = [], i;

    for (i = 2; i <= remainder; i++) {
        while ((remainder % i) === 0) {
            factors.push(i);
            remainder /= i;
        }
    }

    return factors;
}