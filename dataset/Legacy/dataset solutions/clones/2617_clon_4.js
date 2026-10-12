class FenwickTree {
    constructor(size) {
        this.tree = new Array(size + 1).fill(0);
        this.size = size;
    }

    update(index, delta) {
        while (index <= this.size) {
            this.tree[index] += delta;
            index += index & (-index);
        }
    }

    query(index) {
        let sum = 0;
        while (index > 0) {
            sum += this.tree[index];
            index -= index & (-index);
        }
        return sum;
    }
}

function findLowerBound(arr, target) {
    let low = 0;
    let high = arr.length;
    while (low < high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    return low;
}

const MOD = 1000000007;
const MOD_INV_2 = 500000004;

function processInput(rawInput) {
    const lines = rawInput.trim().split('\n');
    const [N_str, K_str] = lines[0].split(' ');
    const N_val = parseInt(N_str, 10);
    const K_val = parseInt(K_str, 10);
    const inputNumbers = lines[1].split(' ').map(Number);

    const sortedInputNumbers = [...inputNumbers].sort((a, b) => a - b);
    let invBetweenTotal = 0;
    for (const num of inputNumbers) {
        invBetweenTotal += findLowerBound(sortedInputNumbers, num);
    }

    const uniqueValues = [...new Set(inputNumbers)].sort((a, b) => a - b);
    const valueRanks = new Map();
    uniqueValues.forEach((val, idx) => valueRanks.set(val, idx + 1));

    const bit = new FenwickTree(uniqueValues.length);
    let invWithinTotal = 0;
    for (let idx = N_val - 1; idx >= 0; idx--) {
        const currentRank = valueRanks.get(inputNumbers[idx]);
        invWithinTotal += bit.query(currentRank - 1);
        bit.update(currentRank, 1);
    }

    const K_mod = K_val % MOD;
    const K_minus_1_mod = (K_val - 1 + MOD) % MOD;
    
    let K_times_K_minus_1_div_2_mod = (K_mod * K_minus_1_mod) % MOD;
    K_times_K_minus_1_div_2_mod = (K_times_K_minus_1_div_2_mod * MOD_INV_2) % MOD;

    let finalResult = (invWithinTotal % MOD * K_mod) % MOD;
    let secondTerm = (invBetweenTotal % MOD * K_times_K_minus_1_div_2_mod) % MOD;
    finalResult = (finalResult + secondTerm) % MOD;

    console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
