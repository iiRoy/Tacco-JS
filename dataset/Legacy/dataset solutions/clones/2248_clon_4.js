function obtenerPrimeraLinea(textoCompleto) {
    const corte = textoCompleto.indexOf("\n");
    return corte === -1 ? textoCompleto : textoCompleto.slice(0, corte);
}

function codigoUnidadUTF16(caracter) {
    const bytes = Buffer.from(caracter[0] || "\u0000", "utf16le");
    return bytes[0] + bytes[1] * 256;
}

function caracterDesdeCodigo(codigo) {
    const bytes = Buffer.alloc(2);
    bytes[0] = codigo & 255;
    bytes[1] = codigo >> 8;
    return bytes.toString("utf16le");
}

function resolverEntrada(textoEntrada) {
    const linea = obtenerPrimeraLinea(textoEntrada);
    const codigoActual = codigoUnidadUTF16(linea);
    const siguienteCaracter = caracterDesdeCodigo(codigoActual + 1);

    console.log(codigoActual);
    console.log(siguienteCaracter);

    return siguienteCaracter;
}

function debug(n) {
    const entrada = document.getElementById("input" + n).value;
    const salidaCalculada = resolverEntrada(entrada);
    const salidaEsperada = document.getElementById("output" + n).value.split("\n")[0];

    document.getElementById("result" + n).innerHTML =
        salidaCalculada === salidaEsperada ? "AC" : "WA";
}

resolverEntrada(require("fs").readFileSync("/dev/stdin", "utf8"));