'use strict'
function main(input) {
    const tmp = input.split("\n");
    const N = parseInt(tmp[0], 10);
    let A = [];
    let B = [];

    for (let i = 1; i <= N; i++) {
        let tmp2 = tmp[i].split(" ");
        A.push(parseInt(tmp2[0], 10));
        B.push(parseInt(tmp2[1], 10));
    }

    let now = 0;
    let keepingDeadline = true;

    while (A.length !== 0) {
        let mostUrgentTaskB = B.reduce((a, b) => Math.min(a, b));
        let mostUrgentTaskInd = B.indexOf(mostUrgentTaskB);
        now += A[mostUrgentTaskInd];

        if (now > B[mostUrgentTaskInd]) {
            keepingDeadline = false;
            break;
        }
        A.splice(mostUrgentTaskInd, 1);
        B.splice(mostUrgentTaskInd, 1);

    }
    if (keepingDeadline) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));