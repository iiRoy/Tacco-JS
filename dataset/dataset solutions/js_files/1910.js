// (Yes/No)
//   隣り合う２つの和が試行回数以上であることを満たせば
//   条件をクリアできるはず
// (パターン)
//   ０未満にならないように順に実行行を出力していけば良いはず
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const line1st = lines[0].split(' ');
const N = line1st[0];
let A = line1st[1];
let B = line1st[2];
let C = line1st[3];

const s = [];
for (let i = 0; i < N; i++) {
    s.push(lines[i + 1]);
}

// console.log(`N=${N}`);
// console.log(`A=${A}`);
// console.log(`B=${B}`);
// console.log(`C=${C}`);

// console.log(s);

const sum = {
    'AB': A + B,
    'AC': A + C,
    'BC': B + C,
};

const order = {
    'AB': 0,
    'AC': 0,
    'BC': 0, 
};

s.forEach(v => {
    order[v] ++;
});

let answerYes = true;
Object.keys(sum).forEach(key => {
    if (sum[key] - order[key] < 0) {
        answerYes = false;
    }
})

if (answerYes) {
    console.log('Yes');
} else {
    console.log('No');
    return;
}

for (let i = 0; i < N - 1; i++) {
    const v = s[i];
    if (v === 'AB') {
        if (A === B) {
            if (s[i] === 'AC') {
                console.log('B');
                B --;
            } else {
                console.log('A');
                A --;
            }
        } else {
            console.log('A');
            A--;
        }
    } else if (v === 'AC') {
        if (A === C) {
            if (s[i] === 'BC') {
                console.log('A');
                A --;
            } else {
                console.log('C');
                C --;
            }
        } else {
            C--;
        }
    } else { // (v === 'BC')
        if (B === C) {
            if (s[i] === 'AC') {
                console.log('B');
                B --;
            } else {
                console.log('C');
                C --;
            }
        } else {
            console.log('C');
            C--;
        }
    }
}

const final = s[N - 1];
if (final === 'AB') {
    if (A < B) {
        console.log('B');
    } else {
        console.log('A');
    }
} else if (final === 'BC') {
    if (C < B) {
        console.log('B');
    } else {
        console.log('C');
    }
} else{ // (final === 'AC')
    if (C < A) {
        console.log('A');
    } else {
        console.log('C');
    }
}