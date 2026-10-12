function main(input) {
    const args = input.split('\n');
    const Num = args[0].split(' ');

    const N = parseInt(Num[0]);
    const P = parseInt(Num[1]);

    if (N === 1) {
        console.log(N)
        return 0;
    }

    var PrimeFactors = [];

    var prime = 7;
    var step = 4;

    const getPrimeFactors = n => {
        if (n < 2) return [];
        if (n === 2 || n === 3 || n === 5) return [n];
        if (n % 2 === 0) return [2, ...getPrimeFactors(n / 2)];
        if (n % 3 === 0) return [3, ...getPrimeFactors(n / 3)];
        if (n % 5 === 0) return [5, ...getPrimeFactors(n / 5)];
        const limit = Math.sqrt(n);
        while (prime <= limit) {
            if (n % prime === 0) return [prime, ...getPrimeFactors(n / prime)];
            prime += step;
            step = 6 - step;
        }
        return [n];
    };

    PF = getPrimeFactors(P);

    var counts = {};

    for (var i = 0; i < PF.length; i++) {
        var key = PF[i];
        counts[key] = (counts[key]) ? counts[key] + 1 : 1;
    }

    console.log(counts.length)

    if(counts.length === 0) {
        console.log(P);
        return 0;
    }

    var ans = 1;

    var key = Object.keys(counts);

    for(var i = 0; i < key.length; i++) {
        if(parseInt(counts[key[i]]) >= N) {
            ans = ans * parseInt(key[i]);
        }
    }

    console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
