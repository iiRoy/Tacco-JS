'use strict';

const main = (input) => {
    const l = input.split('\n');
    const l0 = l[0].split(' ');
    const N = parseInt(l0[0], 10);
    const X = parseInt(l0[1], 10);
    const l1 = l[1].split(' ').slice(0, N);
    let cost = 0;
    let i = N - 1;
    while (i >= 0) {
        cost += 5 * l1[i] + 2 * X;
        let k = 1;
        while (i - k >= 0) {
            const l1k = l1[i - k];
            const defaultCost = 5 * l1k + 2 * X;
            //let testCost = (k + 2) * (k + 2) * l1k - (k + 1) * (k + 1) * l1k + X;
            const testCost = (2 * k + 3) * l1k + X;
            if (defaultCost < testCost) {
                break;
            } else {
                cost += testCost;
                k++;
            }
        }
        i -= k;
    }
    console.log(cost);
};

const isTest = false;

if (isTest) {
    main('2 100\n1 10');
    main('5 1\n1 999999997 999999998 999999999 1000000000');
    main('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
    main('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
} else {
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));
}