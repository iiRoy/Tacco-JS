
function Resolver(datos) {
    datos = datos.split("\n");

    var alto = parseInt(datos[0].split(" ")[0]);
    var ancho = parseInt(datos[0].split(" ")[1]);
    var colores = parseInt(datos[1]);

    partes = datos[2].split(" ");

    cantidades = new Array(colores).fill(0);
    for (indice = 0; indice < colores; indice++) {
        cantidades[indice] = parseInt(partes[indice]);
    }

    var salida = "";

    tablero = new Array(alto).fill(0);
    for (indice = 0; indice < alto; indice++) {
        filaTemporal = new Array(ancho).fill(0);
        tablero[indice] = filaTemporal;
    }

    listaColores = new Array();

    for (indice = 0; indice < colores; indice++) {
        for (subindice = 0; subindice < cantidades[indice]; subindice++) {
            listaColores.push(indice + 1);
        }
    }

    for (indice = 0; indice < alto; indice++) {
        if (indice % 2 != 1) {
            for (subindice = 0; subindice < ancho; subindice++) {
                tablero[indice][subindice] = listaColores[indice * ancho + subindice];
            }
        } else {
            for (subindice = 0; subindice < ancho; subindice++) {
                tablero[indice][subindice] = listaColores[(indice + 1) * ancho - subindice];
            }
        }
    }

    for (indice = 0; indice < alto; indice++) {
        if (indice % 2 != 1) {
            for (subindice = 0; subindice < ancho; subindice++) {
                if (subindice % ancho != ancho - 1) {
                    salida += listaColores[indice * ancho + subindice] + " ";
                } else {
                    salida += listaColores[indice * ancho + subindice] + "\n";
                }
            }
        } else {
            for (subindice = 0; subindice < ancho; subindice++) {
                if (subindice % ancho != ancho - 1) {
                    salida += listaColores[(indice + 1) * ancho - subindice] + " ";
                } else {
                    salida += listaColores[(indice + 1) * ancho - subindice] + "\n";
                }
            }
        }
    }

    salida = salida.substr(0, salida.length - 1);
    console.log('%s', salida);
}

Resolver(require("fs").readFileSync("/dev/stdin", "utf8"));