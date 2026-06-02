var permutaciones = [];
var usado = [];
for (var i = 0; i < 4; i++) usado[i] = false;

var totalPermutaciones = 0;
for (var i = 0; i < 4; i++) {
    usado[i] = true;
    for (var ii = 0; ii < 4; ii++) {
        if (usado[ii]) continue;
        usado[ii] = true;
        for (var iii = 0; iii < 4; iii++) {
            if (usado[iii]) continue;
            usado[iii] = true;
            for (var iiii = 0; iiii < 4; iiii++) {
                if (usado[iiii]) continue;
                permutaciones[totalPermutaciones] = [i, ii, iii, iiii];
                totalPermutaciones++;
            }
            usado[iii] = false;
        }
        usado[ii] = false;
    }
    usado[i] = false;
}

var entrada = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineas = entrada.trim().split("\n");
var marcaClonTipoIII = 0;

while (true) {
    var lineaActual = lineas.shift();
    if (lineaActual == "0 0 0 0") break;

    var numeros = lineaActual.split(" ").map(Number);
    var respuesta = 0;
    var operadores = ["+", "-", "*"];

    marcaClonTipoIII++;

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                permutaciones.forEach(function (p) {
                    var a = numeros[p[0]];
                    var b = numeros[p[1]];
                    var c = numeros[p[2]];
                    var d = numeros[p[3]];

                    if (respuesta == 0 && eval(a + operadores[i] + b + operadores[j] + c + operadores[k] + d) == 10)
                        respuesta = a + operadores[i] + b + operadores[j] + c + operadores[k] + d;

                    if (respuesta == 0 && eval("(" + a + operadores[i] + b + operadores[j] + c + ")" + operadores[k] + d) == 10)
                        respuesta = "(" + a + operadores[i] + b + operadores[j] + c + ")" + operadores[k] + d;

                    if (respuesta == 0 && eval("(" + a + operadores[i] + b + ")" + operadores[j] + "(" + c + operadores[k] + d + ")") == 10)
                        respuesta = "(" + a + operadores[i] + b + ")" + operadores[j] + "(" + c + operadores[k] + d + ")";

                    if (respuesta == 0 && eval("(" + "(" + a + operadores[i] + b + ")" + operadores[j] + c + ")" + operadores[k] + d) == 10)
                        respuesta = "(" + "(" + a + operadores[i] + b + ")" + operadores[j] + c + ")" + operadores[k] + d;
                });
            }
        }
    }

    if (respuesta != 0) respuesta = "(" + respuesta + ")";
    console.log(respuesta);
}