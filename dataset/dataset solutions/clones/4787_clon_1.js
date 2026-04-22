process.stdin.resume( ); // Activa la lectura de la entrada estándar.
process.stdin.setEncoding( 'ascii' ); // Establece la codificación de caracteres para la entrada.

var input_stdin             =   "";  // Cadena para acumular todos los datos de entrada.
var input_stdin_array       =   "";  // Array que contendrá cada línea de entrada separada.
var input_currentline       =   0;   // Índice de la línea actual que se está leyendo.

// Este evento se dispara cuando hay datos disponibles en la entrada estándar.
process.stdin.on( 'data', function ( data ) {
    input_stdin += data; // Concatena los nuevos datos a la cadena principal.
} );

// Este evento se dispara cuando la entrada estándar ha terminado de enviar datos.
process.stdin.on( 'end', function ( ) {
    input_stdin_array = input_stdin.split( "\n" ); // Divide la cadena de entrada en un array de líneas.
    main( ); // Llama a la función principal para procesar la entrada.
} );

/**
 * Función auxiliar para leer una línea de la entrada estándar.
 *
 * @returns {string} La siguiente línea disponible en la entrada.
 */
function readLine( ) {
    return input_stdin_array[ input_currentline++ ]; // Retorna la línea actual y avanza el contador.
}

/*
 * La función principal que contiene la lógica del programa.
 * Implementa el algoritmo de Floyd-Warshall y luego calcula la respuesta.
 */
function main( ) {

  // Lee la primera línea que contiene los valores de N y M.
  var numbers = readLine( ).split( " " );

  // Parsea N (número de nodos) y M (número de aristas) a enteros.
  var N = parseInt( numbers[ 0 ] ),
      M = parseInt( numbers[ 1 ] );

  // Inicializa arrays para almacenar los nodos de inicio, fin y los pesos de las aristas.
  var A = [ ],
      B = [ ],
      C = [ ];

  // Bucle para leer las M aristas del grafo.
  for ( var i = 0 ; i < M ; i++ ) {

    var s = readLine( ).split( " " ); // Lee la línea de la arista actual.

    // Parsea los valores de la arista (a, b, c).
    // Se resta 1 a 'a' y 'b' para convertirlos a índices base 0.
    var a = parseInt( s[ 0 ] ) - 1;
    var b = parseInt( s[ 1 ] ) - 1;
    var c = parseInt( s[ 2 ] );

    // Almacena los componentes de la arista en sus respectivos arrays.
    A.push( a );
    B.push( b );
    C.push( c );

  } // Fin del bucle de lectura de aristas.

  var dp = [ ]; // Declara la matriz de distancias (Dynamic Programming table).

  /*
   * Inicializa la matriz DP para el algoritmo de Floyd-Warshall.
   * dp[i][j] representará la distancia más corta entre el nodo i y el nodo j.
   * Se inicializan las distancias a sí mismo como 0 y el resto como "infinito" (un número grande).
   */
  for ( var i = 0 ; i < N ; i++ ) {

    dp[ i ] = [ ]; // Crea una nueva fila para el nodo 'i'.

    for ( var j = 0 ; j < N ; j++ ) {

      if ( i != j ) {
        dp[ i ].push( 1000000000 ); // Valor grande para representar infinito.
      } else {
        dp[ i ].push( 0 ); // Distancia de un nodo a sí mismo es 0.
      }

    } // Fin del bucle interno (columnas).

  } // Fin del bucle externo (filas).

  /*
   * Rellena la matriz DP con las distancias directas de las aristas existentes.
   * Asume un grafo no dirigido o aristas bidireccionales si existen ambos caminos.
   */
  for ( var i = 0 ; i < M ; i++ ) {

    // Si la distancia directa actual es menor que la registrada, actualiza dp[A[i]][B[i]].
    if ( dp[ A[ i ] ][ B[ i ] ] > C[ i ] ) {
      dp[ A[ i ] ][ B[ i ] ] = C[ i ];
    }

    // Similarmente para el camino inverso (B[i] a A[i]).
    if ( dp[ B[ i ] ][ A[ i ] ] > C[ i ] ) {
      dp[ B[ i ] ][ A[ i ] ] = C[ i ];
    }

  } // Fin del bucle de inicialización con aristas directas.

  /*
   * Implementación del algoritmo de Floyd-Warshall para encontrar todos los caminos más cortos.
   * k es el nodo intermedio que se considera para las rutas.
   */
  for ( var k = 0 ; k < N ; k++ ) {

    for ( var i = 0 ; i < N ; i++ ) {

      for ( var j = 0 ; j < N ; j++ ) {

        // Si el camino de i a j a través de k es más corto que el camino actual directo de i a j.
        if ( dp[ i ][ j ] > dp[ i ][ k ] + dp[ k ][ j ] ) {
          dp[ i ][ j ] = dp[ i ][ k ] + dp[ k ][ j ]; // Actualiza la distancia más corta.
        }

      } // Fin del bucle más interno (j).

    } // Fin del bucle medio (i).

  } // Fin del bucle más externo (k).

  // Inicializa la variable de respuesta con el número total de aristas.
  var ans = M;

  /*
   * Determina cuántas aristas *no* son parte de *ningún* camino más corto.
   * La lógica original decrementa 'ans' si una arista *es* parte de un camino más corto.
   * Esto significa que 'ans' al final contará las aristas que *no* son parte de un camino más corto.
   */
  for ( var i = 0 ; i < M ; i++ ) {

    var shortest = false; // Bandera para indicar si la arista actual (A[i], B[i]) está en un camino más corto.

    for ( var j = 0 ; j < N ; j++ ) {

      // Comprueba si el camino desde 'j' hasta A[i], más el peso de la arista actual C[i],
      // es igual a la distancia más corta ya calculada entre 'j' y B[i].
      // Si es así, significa que la arista (A[i], B[i]) forma parte de un camino más corto desde 'j' a B[i].
      if ( dp[ j ][ A[ i ] ] + C[ i ] == dp[ j ][ B[ i ] ] ) {
        shortest = true; // Marca la arista como parte de un camino más corto.
        break; // Una vez encontrada una ruta, no es necesario seguir buscando con otros 'j'.
      }

    } // Fin del bucle interno (j).

    // Si la arista actual (A[i], B[i]) es parte de al menos un camino más corto,
    // se decrementa 'ans'. Esto significa que 'ans' contará las aristas redundantes.
    if ( shortest == true ) {
      ans--;
    }

  } // Fin del bucle externo (i) para evaluar las aristas.

  console.log( ans ); // Imprime el resultado final.

  process.exit( ); // Finaliza el proceso.

} // Fin de la función main.