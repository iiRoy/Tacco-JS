let input = require("fs").readFileSync("/dev/stdin", "utf8")

// 1 <= x <= y <= z <= 100

function calculateCounts() {
    const [upperBound] = load()

    const maxPossibleSum = 60000 // Maximum value for x*x + y*y + z*z + x*y + y*z + z*x when x,y,z <= 100
    const sumContributions = new Array(maxPossibleSum + 1).fill(0)

    // Generate combinations of (firstVal, secondVal, thirdVal) and accumulate their contributions
    Array.from({ length: 100 }, (_, i) => i + 1).forEach(firstVal => {
        const sqFirst = firstVal * firstVal
        Array.from({ length: 100 - firstVal + 1 }, (_, i) => firstVal + i).forEach(secondVal => {
            const sqSecond = secondVal * secondVal
            Array.from({ length: 100 - secondVal + 1 }, (_, i) => secondVal + i).forEach(thirdVal => {
                const sqThird = thirdVal * thirdVal

                const equationResult = sqFirst + sqSecond + sqThird + firstVal * secondVal + secondVal * thirdVal + thirdVal * firstVal

                // Only process sums within the pre-allocated range
                if (equationResult <= maxPossibleSum) {
                    const distinctElements = new Set([firstVal, secondVal, thirdVal]).size
                    const contributionFactor = (distinctElements === 1) ? 1 : (distinctElements === 2) ? 3 : 6

                    sumContributions[equationResult] += contributionFactor
                }
            })
        })
    })

    // Populate the final result array for the requested range [1, upperBound]
    const computedValues = new Array(upperBound + 1).fill(0)
    for (let currentNum = 1; currentNum <= upperBound; currentNum++) {
        computedValues[currentNum] = sumContributions[currentNum]
    }

    return computedValues.slice(1).join('\n')
}

/*

入力値を読み込む
load(rows = 1, cols = 1, type = Number)

TruthyならYes, FalsyならNo
yesno(boolean) => String

数列の和
array_sum(numbers) => Number

対無限ループ安全装置
inifinite_loop_preventer(max = 1e5)

配列の中から最大値を返す
array_max(numbers, initial_value = null) => Number

配列の中から最小値を返す
array_min(numbers, initial_value = null) => Number

オブジェクトのスナップショットをconsole.logする
log_obj(value)

nを素因数分解 
math_prime_factors(n) => { 素数: n乗 }

2次元配列を作る
new_array_2d(x_len, y_len = 0, init_value = 0) => [[]]

最大公約数
gcd(a, b) => Number

最小公倍数
lcm(a,b) => Number

subsetはsetの部分集合である
check_if_superset(set, subset) => Boolean

和集合
set_union(a, b) => Set

積集合
set_intersection(a, b) => Set

対称差集合
set_symmetric_difference(a, b) => Set

差集合
set_difference(a, b) => Set

配列からc個取る組み合わせ全列挙
set_combinations(array, count) => [[]]

*/


let inputs = input.split(/[\s\n]/)
let inifinite_loop_prevent_counter = 0
let outputString = calculateCounts()
console.log(outputString)

if(outputString === undefined) {
    console.warn("result is undefined")
}
// console.timeEnd()


// 入力値を読み込む
function load(rows = 1, cols = 1, type = Number) {
    const length = rows * cols
    let result = inputs.splice(0, length)

    if(type !== String) result = result.map(type)
    if(cols > 1) {
        const arrays = new Array(cols)
        for(let col = 0; col < cols; col++) {
            arrays[col] = new Array()
            for(let row = 0; row < rows; row++) {
                arrays[col].push(result[row * cols + col])
            }
        }
        result = arrays
    }

    return result
}

// TruthyならYes, FalsyならNo
function yesno(value) {
    return value ? 'Yes' : 'No'
}

// 数列の和
function array_sum(numbers) {
    return numbers.reduce((acc, cur) => acc + cur, 0)
}

// 対無限ループ安全装置
function inifinite_loop_preventer(max = 1e5) {
    inifinite_loop_prevent_counter++
    if(inifinite_loop_prevent_counter >= max) {
        throw new Error("Infinite loop")
    }
}

// 配列の中から最大値を返す
function array_max(numbers, initial_value = null) {
    let result = (initial_value === null) ? numbers[0] : initial_value
    for(const n of numbers) if(n > result) result = n
    return result
}

// 配列の中から最小値を返す
function array_min(numbers, initial_value = null) {
    let result = (initial_value === null) ? numbers[0] : initial_value
    for(const n of numbers) if(n < result) result = n
    return result
}

// オブジェクトのスナップショットをconsole.logする
function log_obj(value) {
    console.log(JSON.parse(JSON.stringify(value)))
}

// 素因数分解 { 素数: n乗 }
function math_prime_factors(n) {
    const result = {}

    for(let i = 2; i * i <= n; i++) {
        if(n % i === 0) {
            n /= i
            result[i] = 1
            
            while(n % i === 0) {
                n /= i
                result[i]++
            }
        }
    }

    if(n > 1) result[n] = 1

    return result
}

// 2次元配列を作る
function new_array_2d(x_len, y_len = 0, init_value = 0) {

    const array = new Array()
    for(let i = 0; i < x_len; i++) {
        const y = y_len ? new Array(y_len).fill(init_value) : new Array()
        array.push(y)
    }

    return array
}

// 最大公約数
function gcd(a, b) {
    if(b === 0) return a
    return gcd(b, a % b)
}

// 最小公倍数
function lcm(a,b) {
    const g = (n, m) => m ? g(m, n % m) : n
    return a * b / g(a, b)
}

// subsetはsetの部分集合である
function check_if_superset(set, subset) {
    for(let el of subset) {
        if(!set.has(el)) {
            return false
        }
    }
    return true
}

// 和集合
function set_union(a, b) {
    const result = new Set(a)
    for(const el of b) result.add(el)
    return result
}

// 積集合
function set_intersection(a, b) {
    let result = new Set()
    for(let el of b) {
        if(a.has(el)) {
            result.add(el)
        }
    }
    return result
}

// 対称差集合
function set_symmetric_difference(a, b) {
    let result = new Set(a)
    for(let el of b) {
        if(result.has(el)) {
            result.delete(el)
        } else {
            result.add(el)
        }
    }
    return result
}

// 差集合
function set_difference(a, b) {
    let result = new Set(a)
    for(let el of b) result.delete(el)
    return result
}

// 配列からc個取る組み合わせ全列挙
function set_combinations(array, count) {
    
    const result = []

    function _combi({ pre = [], rest }) {

        if(pre.length + rest.length < count) return

        if(pre.length < count) {
            for(let i = 0; i < rest.length; i++) {
                _combi({
                    pre: [...pre, rest[i]],
                    rest: rest.slice(0,i)
                })
            }
        } else {
            result.push(pre)
        }
    }

    _combi({ rest: array })

    return result
}

function math_permutation(n, r) {
    let res = 1
    for(let i = 0; i < r; i++) {
        res *= n - i
    }
    return res
}

function math_combination(n, r) {
    return math_permutation(n, r) / math_permutation(r, r)
}
