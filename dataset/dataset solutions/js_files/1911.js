// (Yes/No)
//   隣り合う２つの和が試行回数以上であることを満たせば
//   条件をクリアできるはず
// (パターン)
//   ０未満にならないように順に実行行を出力していけば良いはず
const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const line1st = lines[0].split(' ');
const N = +line1st[0];
let A = +line1st[1];
let B = +line1st[2];
let C = +line1st[3];

// console.log(`N=${N} A=${A} B=${B} C=${C}`)

const s = [];
for (let i = 0; i < N; i++) {
    s.push(lines[i + 1]);
}

let isYes = true;
const ans = [];

for (let i = 0; i < N - 1; i++) {
    const v = s[i];
    const next = s[i + 1];
    if (v === 'AB') {
        // console.log(`AB: `)
        // console.log(`N=${N} A=${A} B=${B} C=${C}`)
        if (A === 0 && B === 0) {
            isYes = false;
            break;
        } else if (A === 0) {
            A ++;
            B --;
            ans.push('A');
        } else if (B === 0) {
            A --;
            B ++;
            ans.push('B');
        } else if (next === 'AC' && A === 1) {
            A ++;
            B --;
            ans.push('A');
        } else if (next === 'BC' && B === 1) {
            A --;
            B ++;
            ans.push('B');
        } else {
            A ++;
            B --;
            ans.push('A');
        }
    } else if (v === 'AC') {
        if (A === 0 && C === 0) {
            isYes = false;
            break;
        } else if (A === 0) {
            A ++;
            C --;
            ans.push('A');
        } else if (C === 0) {
            A --;
            C ++;
            ans.push('C');
        } else if (next === 'AB' && A === 1) {
            A ++;
            C --;
            ans.push('A');
        } else if (next === 'BC' && C === 1) {
            A --;
            C ++;
            ans.push('C');
        } else {
            A ++;
            C --;
            ans.push('A');
        }
    } else { // (v === 'BC')
        if (B === 0 && C === 0) {
            isYes = false;
            break;
        } else if (B === 0) {
            B ++;
            C --;
            ans.push('B');
        } else if (C === 0) {
            B --;
            C ++;
            ans.push('C');
        } else if (next === 'AB' && B === 1) {
            B ++;
            C --;
            ans.push('B');
        } else if (next === 'AC' && C === 1) {
            B --;
            C ++;
            ans.push('C');
        } else {
            B ++;
            C --;
            ans.push('B');
        }
    }
}

const final = s[N - 1];
if (final === 'AB') {
    if (A < B) {
        ans.push('A');
    } else if (A === B && A === 0) {
        console.log('No');
        return;
    } else {
        ans.push('B');
    }
} else if (final === 'BC') {
    if (C < B) {
        ans.push('C');
    } else if (C === B && C === 0) {
        console.log('No');
        return;
    } else {
        ans.push('B');
    }
} else { // (final === 'AC')
    if (C < A) {
        ans.push('C');
    } else if (C === A && C === 0) {
        console.log('No');
        return;
    } else {
        ans.push('A');
    }
}

if (!isYes) {
    console.log('No');
    return;
}
console.log('Yes');

ans.forEach(v => console.log(v));
