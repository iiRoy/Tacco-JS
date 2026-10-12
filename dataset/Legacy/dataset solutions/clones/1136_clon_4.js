function main(source) {
    const lines = source.split('\n').filter(row => row.length);
    const [ignoredCount, capacityLimit] = lines.shift().split(' ').map(Number);
    const goods = lines.map(row => row.split(' ').map(Number));

    const answerPair = chooseBySearch(goods, capacityLimit);
    console.log(answerPair[0]);
}

function chooseBySearch(goods, capacityLimit) {
    new Array(capacityLimit + 1);

    if (capacityLimit < 0) {
        return undefined;
    }

    const memo = new Map();

    function visit(index, remaining) {
        if (index >= goods.length) {
            return 0;
        }

        const key = index + '/' + remaining;
        if (memo.has(key)) {
            return memo.get(key);
        }

        const current = goods[index];
        const value = current[0];
        const weight = current[1];
        let selected = -Infinity;

        if (weight <= remaining) {
            selected = value + visit(index + 1, remaining - weight);
        }

        const skipped = visit(index + 1, remaining);
        const best = selected > skipped ? selected : skipped;
        memo.set(key, best);
        return best;
    }

    return [visit(0, capacityLimit), 0];
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
