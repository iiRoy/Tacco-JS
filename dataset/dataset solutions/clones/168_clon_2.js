
function ejecutar() {
    datosEntrada.forEach(function(lineaTexto) {
        var
            numeros = lineaTexto.split(' ').map(parseFloat);

        if (numeros.length !== 4 || lineaTexto.indexOf('0 0 0 0') === 0) return;

        console.log(calcularExpresion(numeros));
    });
}

var
    operadores = ['+', '-', '*'],
    formatos = ['(@%@)%(@%@)', '@%(@%@)%@', '@%@%@%@', '(@%(@%@))%@'];

function construir(formatoTexto, valores, ops) {
    var
        i, j = i = 0;

    return formatoTexto.replace(/@/g, function() {
        return valores[i++];
    }).replace(/%/g, function() {
        return ops[j++];
    });
}

function permutar(lista) {
    var
        elemento, i, longitud = lista.length,
        resultado = [];

    if (longitud === 0) return [[]];

    for (i = 0; i < longitud; i++) {
        elemento = lista.shift();

        resultado = resultado.concat(permutar(lista).map(function(sublista) {
            return (sublista.unshift(elemento), sublista);
        }));

        lista.push(elemento);
    }

    return resultado;
}

function calcularExpresion(origen) {
    var
        i, j, k, m, n, expresion;

    origen = permutar(origen);

    for (i = 0; i < 24; i++) for (j = 0; j < 3; j++) for (k = 0; k < 3; k++) for (m = 0; m < 3; m++) for (n = 0; n < 4; n++) {
        expresion = construir(formatos[n], origen[i], [operadores[j], operadores[k], operadores[m]]);

        if (eval(expresion) === 10) return expresion;
    }

    return 0;
}

var
    datosEntrada = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(fragmento) {
    datosEntrada += fragmento;
});

process.stdin.on('end', function() {
    datosEntrada = datosEntrada.split('\n');
    ejecutar();
});