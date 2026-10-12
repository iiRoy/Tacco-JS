"use strict";
const moduloArchivo = require("fs");
const contenidoEntrada = moduloArchivo.readFileSync("/dev/stdin", "UTF-8");
const textoEntrada = contenidoEntrada.trim();
const valorEntrada = Number(textoEntrada);

let resultadoSalida;
const cumpleCondicion = valorEntrada === 3 || valorEntrada === 5 || valorEntrada === 7;

if (cumpleCondicion) {
  resultadoSalida = "YES";
} else {
  resultadoSalida = "NO";
}

console.log(resultadoSalida);
