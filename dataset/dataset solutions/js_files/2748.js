'use strict'
function main(input) {
    const tmp = input.split('\n');
    const N = parseInt(tmp[0], 10);
    const hat = tmp[1].split(' ').map((h) => parseInt(h, 10));
    const binHat = hat.map((h) => parseInt(h.toString(2)));

    const map = new Map();
    for (let h of binHat) {
        if (!map.has(h)) {
            map.set(h, 1);
        } else {
            map.set(h, map.get(h) + 1);
        }
    }

    let keys = [];
    for (let key of map.keys()) {
        keys.push(key);
    }
    let keyCount = keys.length;
    let flag = false;

    if (N % 3 === 0) {
        if (keyCount === 3) {
            const xorSum = keys[0] ^ keys[1] ^ keys[2];
            if (xorSum === 0) {
                if ((map.get(keys[0]) === N / 3) && (map.get(keys[1]) === N / 3) && (map.get(keys[2]) === N / 3)) {
                    flag = true;
                }
            }

        } else if (keyCount === 2) {
            flag = true;
            if (keys.indexOf(0) !== -1) {
                keys.splice(keys.indexOf(0), 1);
                if ((map.get(0) === N / 3) && (map.get(keys[0]) === ((2 * N) / 3))) {
                    flag = true;
                }
            }

        } else if (keyCount === 1) {
            if (keys[0] === 0) {
                flag = true;
            }

        }
    } else {
        if (keyCount === 1) {
            if (keys[0] === 0) {
                flag = true;
            }

        }
    }

    if (flag) {
        console.log('Yes');
    } else {
        console.log('No');
    }


}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));