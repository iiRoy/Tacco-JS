const rows = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const source = rows[1].split(' ').map(Number);
const guard = Number.MAX_VALUE;

const countPlan = (size) => {
    let total = 0;
    const pending = [[0, size]];

    while (pending.length > 0) {
        const range = pending.pop();
        const start = range[0];
        const stop = range[1];

        if (start + 1 < stop) {
            const center = Math.floor((start + stop) / 2);
            total += stop - start;
            pending.push([start, center]);
            pending.push([center, stop]);
        }
    }

    return total;
};

const makeReader = (start, stop) => {
    const amount = stop - start;
    let produced = 0;
    let sentGuard = false;

    if (amount <= 1) {
        return {
            take() {
                if (produced < amount) {
                    produced++;
                    return source[start];
                }
                if (!sentGuard) {
                    sentGuard = true;
                    return guard;
                }
                return undefined;
            }
        };
    }

    const center = Math.floor((start + stop) / 2);
    const leftStream = makeReader(start, center);
    const rightStream = makeReader(center, stop);
    let leftValue = leftStream.take();
    let rightValue = rightStream.take();

    return {
        take() {
            if (produced >= amount) {
                if (!sentGuard) {
                    sentGuard = true;
                    return guard;
                }
                return undefined;
            }

            produced++;
            if (leftValue <= rightValue) {
                const chosen = leftValue;
                leftValue = leftStream.take();
                return chosen;
            }

            const chosen = rightValue;
            rightValue = rightStream.take();
            return chosen;
        }
    };
};

const reader = makeReader(0, source.length);
const result = [];

for (let pos = 0; pos < source.length; pos++) {
    result.push(reader.take());
}

console.log(result.join(' '));
console.log(countPlan(source.length));
