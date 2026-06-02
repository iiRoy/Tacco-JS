function revisarSecuencia(listaCaracteres, posicionActual, totalParejas, huboCambio) {
    if (posicionActual >= listaCaracteres.length) {
        if (huboCambio) {
            return revisarSecuencia(listaCaracteres, 0, totalParejas, false);
        }

        console.log(totalParejas * 2);
        return;
    }

    console.log(listaCaracteres);

    let contadorActualizado = totalParejas;
    let cambioActualizado = huboCambio;

    if (listaCaracteres[posicionActual] === "1" && listaCaracteres[posicionActual + 1] === "0") {
        contadorActualizado++;
        cambioActualizado = true;
        listaCaracteres.splice(posicionActual, 2);
    }

    if (listaCaracteres[posicionActual] === "0" && listaCaracteres[posicionActual + 1] === "1") {
        contadorActualizado++;
        cambioActualizado = true;
        listaCaracteres.splice(posicionActual, 2);
    }

    revisarSecuencia(listaCaracteres, posicionActual + 1, contadorActualizado, cambioActualizado);
}

const contenidoEntrada = require("fs").readFileSync("/dev/stdin", "utf8");
const caracteresEntrada = contenidoEntrada.split("");

revisarSecuencia(caracteresEntrada, 0, 0, false);