function determineNetworkGroupCount(totalVertices, connections) {
    const parent = Array.from(
        { length: totalVertices },
        (_, vertex) => vertex
    );

    const treeHeight =
        new Array(totalVertices).fill(0);

    function findRepresentative(vertex) {
        let root = vertex;

        while (parent[root] !== root) {
            root = parent[root];
        }

        let currentVertex = vertex;

        while (parent[currentVertex] !== currentVertex) {
            const nextVertex = parent[currentVertex];

            parent[currentVertex] = root;
            currentVertex = nextVertex;
        }

        return root;
    }

    function joinGroups(firstVertex, secondVertex) {
        let firstRoot =
            findRepresentative(firstVertex);

        let secondRoot =
            findRepresentative(secondVertex);

        if (firstRoot === secondRoot) {
            return false;
        }

        if (treeHeight[firstRoot] < treeHeight[secondRoot]) {
            const temporaryRoot = firstRoot;
            firstRoot = secondRoot;
            secondRoot = temporaryRoot;
        }

        parent[secondRoot] = firstRoot;

        if (treeHeight[firstRoot] === treeHeight[secondRoot]) {
            treeHeight[firstRoot] += 1;
        }

        return true;
    }

    let groupCount = totalVertices;

    for (const [firstVertex, secondVertex] of connections) {
        const groupsWereJoined =
            joinGroups(firstVertex, secondVertex);

        if (groupsWereJoined) {
            groupCount -= 1;
        }
    }

    return groupCount;
}