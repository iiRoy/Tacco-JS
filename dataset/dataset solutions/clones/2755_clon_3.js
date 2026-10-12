const range = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

var N = range(2, 18);

var study = [];
for (var i = 0; i < N; i++) {
    study[i] = range(1, N);
}

while (N !== 2) {
    var re = Infinity;
    var tr = -1;

    for (var i = 1; i < study.length - 1; i++) {
        if (study[i] < re) {
            re = study[i];
            tr = i;
        }
    }

    if (tr <= 0 || tr >= study.length - 1) {
        break;
    }

    study = calcu(N, study, tr);
    study.splice(tr, 1);
    N--;
}

N = study[0] + study[1];
console.log(N);

function calcu(N, study, tr) {
    var value = study[tr];

    for (var j = 0; j < N; j++) {
        if (tr - 1 === j || tr + 1 === j) {
            study[j] = study[j] + value;
        } else if (tr === j) {
            continue;
        }
    }

    return study;
}