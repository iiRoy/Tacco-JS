const fs = require('fs');

function buildFloatingCityMap() {
    const input = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const totalCities = input.shift();
    const totalBridges = input.shift();

    const routes = Array.from(
        { length: totalCities + 1 },
        () => []
    );

    for (let bridge = 0; bridge < totalBridges; bridge++) {
        const from = input.shift();
        const to = input.shift();

        routes[from].push(to);
        routes[to].push(from);
    }

    return {
        totalCities,
        routes,
    };
}

function markConnectedCities(startingCity, routes, marked) {
    const pendingCities = [startingCity];

    while (pendingCities.length > 0) {
        const currentCity = pendingCities.pop();

        if (marked[currentCity]) {
            continue;
        }

        marked[currentCity] = true;

        for (const adjacentCity of routes[currentCity]) {
            if (!marked[adjacentCity]) {
                pendingCities.push(adjacentCity);
            }
        }
    }
}

function countIndependentNetworks(cityMap) {
    const marked = new Array(
        cityMap.totalCities + 1
    ).fill(false);

    let components = 0;
    let currentCity = 1;

    while (currentCity <= cityMap.totalCities) {
        if (!marked[currentCity]) {
            markConnectedCities(
                currentCity,
                cityMap.routes,
                marked
            );

            components++;
        }

        currentCity++;
    }

    return components;
}

const floatingCityMap = buildFloatingCityMap();

process.stdout.write(
    `${countIndependentNetworks(floatingCityMap)}\n`
);