function canEscapeTemple(platforms) {
    if (platforms.length === 0) {
        return false;
    }

    const reachable = new Array(platforms.length).fill(false);
    reachable[0] = true;

    for (let current = 0; current < platforms.length; current++) {
        if (!reachable[current]) {
            continue;
        }

        const limit = Math.min(
            current + platforms[current],
            platforms.length - 1
        );

        for (let next = current + 1; next <= limit; next++) {
            reachable[next] = true;
        }
    }

    return reachable[platforms.length - 1];
}

const temple = [2, 3, 1, 1, 4];
console.log(canEscapeTemple(temple)); // true