((inputContent) => {
    const processLineAndDecideContinuation = (currentInputLine) => {
        const numericParts = currentInputLine.split(' ');
        const valA = Number(numericParts[0]);
        const valB = Number(numericParts[1]);

        if (valA === 0 && valB === 0) {
            return true;
        }

        const minimumValue = Math.min(valA, valB);
        const maximumValue = Math.max(valA, valB);

        console.log(`${minimumValue} ${maximumValue}`);
        return false;
    };

    inputContent
        .split('\n')
        .some(processLineAndDecideContinuation);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
