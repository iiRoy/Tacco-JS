function simulatePath(rawInputData) {
    const rotationConstant = 90;
    let turnAngle = rotationConstant;

    let currentPosition = { x: 0, y: 0 };
    let facingDirection = 90;

    let totalSteps = 0;

    const applyMovementStep = (position, directionValue) => {
        let nextX = position.x;
        let nextY = position.y;

        switch (directionValue) {
            case 90:
                nextY += 1;
                break;
            case 180:
                nextX += 1;
                break;
            case 270:
                nextY -= 1;
                break;
            case 360:
                nextX -= 1;
                break;
        }
        return { x: nextX, y: nextY };
    };

    do {
        totalSteps = totalSteps + 1;

        currentPosition = applyMovementStep(currentPosition, facingDirection);

        facingDirection += turnAngle;

    } while (!(currentPosition.x === 0 && currentPosition.y === 0));

    console.log(totalSteps);
}

simulatePath(require("fs").readFileSync("/dev/stdin", "utf8"));
