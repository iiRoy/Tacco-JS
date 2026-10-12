/*
 * Cuenta las regiones independientes
 * de un grafo no dirigido.
 */
function countConnectedComponents
(
    nodeCount,
    edges
)
{
    // Crear una lista de vecinos para cada nodo.
    const adjacencyList =
        Array.from
        (
            {
                length:
                    nodeCount
            },
            () =>
                []
        );

    // Registrar las conexiones en ambos sentidos.
    for
    (
        const
        [
            firstNode,
            secondNode
        ]
        of
        edges
    )
    {
        adjacencyList
        [
            firstNode
        ]
        .push
        (
            secondNode
        );

        adjacencyList
        [
            secondNode
        ]
        .push
        (
            firstNode
        );
    }

    const visitedNodes =
        new Set();

    let componentCount =
        0;

    // Intentar iniciar un recorrido desde cada nodo.
    for
    (
        let node = 0;
        node < nodeCount;
        node++
    )
    {
        if
        (
            visitedNodes.has
            (
                node
            )
        )
        {
            continue;
        }

        componentCount++;

        const pendingNodes =
        [
            node
        ];

        visitedNodes.add
        (
            node
        );

        // Explorar todo el componente actual.
        while
        (
            pendingNodes.length > 0
        )
        {
            const currentNode =
                pendingNodes.pop();

            const neighbors =
                adjacencyList
                [
                    currentNode
                ];

            for
            (
                const neighbor
                of neighbors
            )
            {
                if
                (
                    visitedNodes.has
                    (
                        neighbor
                    )
                )
                {
                    continue;
                }

                visitedNodes.add
                (
                    neighbor
                );

                pendingNodes.push
                (
                    neighbor
                );
            }
        }
    }

    return componentCount;
}