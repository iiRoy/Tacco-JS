/*
 * Validar el orden de los valores
 * contenidos en un árbol binario.
 */
function isValidBinarySearchTree
(
    root
)
{
    const orderedValues =
        [];

    // Recorrido izquierdo, nodo y derecho.
    function traverseInOrder
    (
        node
    )
    {
        if
        (
            node === null
        )
        {
            return;
        }

        traverseInOrder
        (
            node.left
        );

        orderedValues.push
        (
            node.value
        );

        traverseInOrder
        (
            node.right
        );
    }

    traverseInOrder
    (
        root
    );

    // Los valores deben ser estrictamente crecientes.
    for
    (
        let position = 1;
        position < orderedValues.length;
        position++
    )
    {
        if
        (
            orderedValues[position]
            <=
            orderedValues[position - 1]
        )
        {
            return false;
        }
    }

    return true;
}