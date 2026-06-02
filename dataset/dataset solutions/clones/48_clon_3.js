process.stdin.on("data", function(dato) {
    var texto = dato + "";
    var lineas = texto.trim().split("\n");
    var limite = +lineas[0];
    var lista = [];

    while (lista[limite] = limite--) {
    }

    var cambios = lineas.slice(2);
    cambios.some(function(fila, temporal) {
        var partes = fila.split(",");
        var primero = +partes[0];
        var segundo = +partes[1];

        temporal = lista[primero];
        lista[primero] = lista[segundo];
        lista[segundo] = temporal;
    });

    var resultado = lista.slice(1);
    resultado.some(function(valor) {
        var salida = valor;
        console.log(salida);
    });
}).resume();
