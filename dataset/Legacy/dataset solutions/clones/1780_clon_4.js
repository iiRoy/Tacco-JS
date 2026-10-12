let input = require("fs").readFileSync("/dev/stdin", "utf8")

function main({ input, load, yesno, math_sum }) {

    const [countOfNumbers] = load()
    const numberArray = load(countOfNumbers)

    let maximumValue = 0
    for (const val of numberArray) {
        if (val > maximumValue) {
            maximumValue = val
        }
    }

    const frequencyMap = new Map()
    for (const num of numberArray) {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1)
    }

    const distinctNumbers = new Set(numberArray)

    const numbersToExclude = new Set()
    for (let currentDivisor = 1; currentDivisor <= maximumValue; currentDivisor++) {
        if (distinctNumbers.has(currentDivisor)) {
            for (let multiple = currentDivisor * 2; multiple <= maximumValue; multiple += currentDivisor) {
                numbersToExclude.add(multiple)
            }
        }
    }

    let finalCount = 0
    for (const num of frequencyMap.keys()) {
        if (frequencyMap.get(num) === 1 && !numbersToExclude.has(num)) {
            finalCount++
        }
    }

    console.log(finalCount)
}

let inputs = input.split(/[\s\n]/)
main({
    input,
    yesno: value => value ? 'Yes' : 'No',
    load(rows = 1, cols = 1, is_number = true) {
        const length = rows * cols
        let result = inputs.splice(0, length)
        if(is_number) result = result.map(Number)
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
    },
    inifinite_loop_preventer() {
        throw new Error("Infinite loop")
    },
    math_sum(numbers) {
        return numbers.reduce((acc, cur) => acc + cur, 0)
    },
})
