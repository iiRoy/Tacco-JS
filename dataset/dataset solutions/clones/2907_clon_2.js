function calculateEvenSum(values) {
    let result = 0;

    for (let index = 0; index < values.length; index++) {
        if (values[index] % 2 === 0) {
            result += values[index];
        }
    }

    return result;
}