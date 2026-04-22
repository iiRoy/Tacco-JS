
let input = require("fs").readFileSync("/dev/stdin", "utf8")

function main({ input, load, yesno, math_sum }) {

    const [N] = load()
    const A = load(N)

    let Ai_max = 0
    for(const a of A) if(a > Ai_max) Ai_max = a

    const nums = new Array(Ai_max + 1).fill(0)

    for(const a of A) nums[a]++

    for(let i = 1; i <= Ai_max; i++) {
        if(!nums[i]) continue
        for(let j = i * 2; j <= Ai_max; j += i) {
            nums[j] = 0
        }
    }

    console.log(nums.filter(n => n === 1).length)
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
