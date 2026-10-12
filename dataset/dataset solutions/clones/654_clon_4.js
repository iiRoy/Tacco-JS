const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const totalPlatforms = transmission.shift();
const totalLinks = transmission.shift();

const parent = Array.from(
    { length: totalPlatforms + 1 },
    (_, platform) => platform
);

const groupSize = new Array(
    totalPlatforms + 1
).fill(1);

function findLeader(platform) {
    let root = platform;

    while (parent[root] !== root) {
        root = parent[root];
    }

    while (parent[platform] !== platform) {
        const nextPlatform = parent[platform];
        parent[platform] = root;
        platform = nextPlatform;
    }

    return root;
}

function connectPlatforms(firstPlatform, secondPlatform) {
    let firstLeader = findLeader(firstPlatform);
    let secondLeader = findLeader(secondPlatform);

    if (firstLeader === secondLeader) {
        return false;
    }

    if (groupSize[firstLeader] < groupSize[secondLeader]) {
        const temporaryLeader = firstLeader;
        firstLeader = secondLeader;
        secondLeader = temporaryLeader;
    }

    parent[secondLeader] = firstLeader;
    groupSize[firstLeader] += groupSize[secondLeader];

    return true;
}

let independentNetworks = totalPlatforms;

for (let link = 0; link < totalLinks; link++) {
    const firstPlatform = transmission.shift();
    const secondPlatform = transmission.shift();

    if (connectPlatforms(firstPlatform, secondPlatform)) {
        independentNetworks--;
    }
}

console.log(independentNetworks);