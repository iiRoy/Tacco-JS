function resolveLargestNumber(numbers) {
    function inspectRange(start, end) {
        if (start === end) {
            return numbers[start];
        }

        const middle = Math.floor((start + end) / 2);

        const largestFromLeft = inspectRange(start, middle);
        const largestFromRight = inspectRange(middle + 1, end);

        return largestFromLeft > largestFromRight
            ? largestFromLeft
            : largestFromRight;
    }

    return numbers.length
        ? inspectRange(0, numbers.length - 1)
        : null;
}