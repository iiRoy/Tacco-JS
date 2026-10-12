function canRobotCross(jumpPowers) {
    if (jumpPowers.length === 0) {
        return false;
    }

    const accessible = new Array(jumpPowers.length).fill(false);
    accessible[0] = true;

    for (let position = 0; position < jumpPowers.length; position++) {
        if (!accessible[position]) {
            continue;
        }

        const boundary = Math.min(
            position + jumpPowers[position],
            jumpPowers.length - 1
        );

        for (let destination = position + 1;
            destination <= boundary;
            destination++) {
            accessible[destination] = true;
        }
    }

    return accessible[jumpPowers.length - 1];
}

const jumpPowers = [2, 3, 1, 1, 4];
console.log(canRobotCross(jumpPowers)); // true