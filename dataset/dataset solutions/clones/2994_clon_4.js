function Main(input) {
    const gridHeight = parseInt(input.shift());
    const gridWidth = parseInt(input.shift());
    const moveCount = parseInt(input.shift());
    const startRow = parseInt(input.shift());
    const startCol = parseInt(input.shift());
    const playerPath = input.shift();
    const enemyPath = input.shift();

    let currentRegion = {
        x1: startCol,
        x2: startCol,
        y1: startRow,
        y2: startRow
    };

    const playerActionMap = {
        'L': (region) => ({ ...region, x1: region.x1 - 1 }),
        'R': (region) => ({ ...region, x2: region.x2 + 1 }),
        'U': (region) => ({ ...region, y1: region.y1 - 1 }),
        'D': (region) => ({ ...region, y2: region.y2 + 1 })
    };

    const enemyActionMap = {
        'L': (region) => ({ ...region, x2: Math.max(1, region.x2 - 1) }),
        'R': (region) => ({ ...region, x1: Math.min(gridWidth, region.x1 + 1) }),
        'U': (region) => ({ ...region, y2: Math.max(1, region.y2 - 1) }),
        'D': (region) => ({ ...region, y1: Math.min(gridHeight, region.y1 + 1) })
    };

    const checkRegionValidity = (region) => {
        return region.x1 > 0 && region.x2 <= gridWidth && region.y1 > 0 && region.y2 <= gridHeight;
    };

    const finalRegion = Array.from({ length: moveCount }).reduce((currentBounds, _, idx) => {
        if (!currentBounds) {
            return null;
        }

        const playerMoveChar = playerPath[idx];
        let afterPlayerMove = playerActionMap[playerMoveChar](currentBounds);

        if (!checkRegionValidity(afterPlayerMove)) {
            return null;
        }

        const enemyMoveChar = enemyPath[idx];
        let afterEnemyMove = enemyActionMap[enemyMoveChar](afterPlayerMove);

        return afterEnemyMove;

    }, currentRegion);

    if (finalRegion) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
