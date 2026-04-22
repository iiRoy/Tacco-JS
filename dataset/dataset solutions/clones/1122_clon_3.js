/*
    // Este script calcula el área de un polígono dado un conjunto de coordenadas.
    // Basado en el algoritmo de la fórmula de la cuerda (Shoelace formula).
    // Originalmente para el juez en línea Aizu Online Judge (ID: 0079).
    //
    // Estado: Adaptado y optimizado para mayor claridad y robustez.
    // Notas: La entrada espera pares de coordenadas (x, y) por línea.
    //        La primera línea de entrada (que a menudo contiene el número de puntos)
    //        se ignora en esta implementación, asumiendo que todos los puntos
    //        relevantes siguen a la primera línea.
*/

// Alias para la función de salida de consola, mejorando la legibilidad y la posibilidad de cambiar el destino de la salida.
const outputStream = console.log;

// Bloque de manejo de entrada estándar para entornos Node.js
if (typeof process !== "undefined" && process.stdin) {
    let rawInputData = ""; // Almacena todos los datos de entrada sin procesar.

    // Configura el listener para los datos entrantes.
    process.stdin.on('data', (inputSegment) => {
        rawInputData += inputSegment; // Concatena los fragmentos de datos.
    });

    // Configura el listener para cuando la entrada termina.
    process.stdin.on('end', () => {
        // Divide la entrada bruta en líneas y las pasa a la función principal de procesamiento.
        const inputDataRows = rawInputData.split('\n');
        executePolygonAreaCalculation(inputDataRows);
    });
}


/**
 * Función principal para procesar las líneas de entrada y calcular el área del polígono.
 * @param {string[]} rawLines - Un array de cadenas, donde cada cadena representa una línea de entrada.
 */
function executePolygonAreaCalculation(rawLines) {
    // Eliminar líneas vacías y procesar cada línea para extraer coordenadas numéricas.
    let processedCoordinates = rawLines
        .filter(line => line.trim() !== '') // Elimina líneas completamente vacías.
        .map(line => {
            // Divide la línea por espacios, filtra elementos vacíos y convierte a números.
            const coordinates = line.split(/\s+/).filter(s => s !== '').map(parseFloat);
            // Valida que cada línea contenga exactamente dos números (x, y).
            if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
                // Si la línea no es válida, devolvemos null o un indicador para filtrarla más tarde.
                return null;
            }
            return coordinates;
        })
        .filter(coordPair => coordPair !== null); // Elimina las líneas que no se pudieron parsear correctamente.

    // La primera línea a menudo contiene el número de vértices, que no se usa en esta implementación.
    // Se asume que la lista de puntos comienza desde la segunda línea de entrada.
    if (processedCoordinates.length > 0) {
        processedCoordinates.shift(); // Descartar la primera fila si existe, asumiendo que es una cabecera.
    }

    const polygonVertices = processedCoordinates;

    // Validación de entrada: un polígono requiere al menos 3 vértices.
    if (polygonVertices.length < 3) {
        outputStream("Error: Se requieren al menos 3 vértices para formar un polígono válido.");
        return;
    }

    // El primer vértice se usa como punto de anclaje para la triangulación.
    const anchorVertex = polygonVertices[0];
    let cumulativeCrossProductSum = 0; // Acumulador para la suma de productos cruzados.

    // Iterar a través de los vértices para formar triángulos con el punto de anclaje.
    // La fórmula de la cuerda se implementa como la suma de áreas firmadas de triángulos
    // formados por (anchorVertex, currentVertex, nextVertex).
    for (let i = 1; i < polygonVertices.length - 1; i++) {
        const currentVertex = polygonVertices[i];
        const nextVertex = polygonVertices[i + 1];

        // Calcular el producto cruzado 2D de los vectores (currentVertex - anchorVertex) y (nextVertex - anchorVertex).
        cumulativeCrossProductSum += calculateVectorCrossProduct2D(anchorVertex, currentVertex, nextVertex);
    }

    // El área del polígono es la mitad del valor absoluto de la suma acumulada.
    // Math.abs se usa para asegurar que el área siempre sea positiva,
    // independientemente del orden de los vértices (sentido horario/antihorario).
    const calculatedArea = Math.abs(cumulativeCrossProductSum / 2);

    // Formatear el resultado a una cadena con un decimal.
    // toFixed(1) asegura que siempre haya un decimal, incluso si el resultado es un número entero.
    const finalAreaDisplay = calculatedArea.toFixed(1);

    // Mostrar el resultado final.
    outputStream(finalAreaDisplay);
}

/**
 * Calcula el producto cruzado 2D de dos vectores formados por tres puntos.
 * Esto es equivalente a 2 veces el área firmada del triángulo (A, B, C).
 * El cálculo es (Bx - Ax)*(Cy - Ay) - (By - Ay)*(Cx - Ax).
 *
 * @param {number[]} vertexA - El primer punto (origen del vector). [x, y]
 * @param {number[]} vertexB - El segundo punto (punto final del primer vector). [x, y]
 * @param {number[]} vertexC - El tercer punto (punto final del segundo vector). [x, y]
 * @returns {number} El producto cruzado 2D.
 */
function calculateVectorCrossProduct2D(vertexA, vertexB, vertexC) {
    // Vector AB (desde A hasta B)
    const vectorAB_x = vertexB[0] - vertexA[0];
    const vectorAB_y = vertexB[1] - vertexA[1];

    // Vector AC (desde A hasta C)
    const vectorAC_x = vertexC[0] - vertexA[0];
    const vectorAC_y = vertexC[1] - vertexA[1];

    // Producto cruzado 2D: (AB_x * AC_y) - (AB_y * AC_x)
    return (vectorAB_x * vectorAC_y) - (vectorAB_y * vectorAC_x);
}