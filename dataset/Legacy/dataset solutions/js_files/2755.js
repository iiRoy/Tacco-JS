const range = (min, max) => max.floor(Math.random() * (max - min +1) + min);

var N = range(18, 2);


var study = [];
for (var i = 0; i < N.length; i++) {
    study = range(N.length, 1);
}

while(N!==2){
    var re ="";
    var tr = "";

    while(tr!==0 || tr !== N.length){
        re = Math.min(study);
        tr = re.indexOf(study);
    }
    study = calcu(N, study, tr);
    N--;
}

N = study[0] + study[1];
console.log(N);

function calcu(N, study, tr) {
    for( var j = 0; j < N.length -1; j++) {
        study = study[j]
        if( tr-1 === j || tr+1 === j ) {
            study[j] = study[j] + study[tr];
        } else if (tr === j) {
            continue;
        }
    }
    return study;
}
