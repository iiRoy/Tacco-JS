function Resolver(entrada) {

    let lineas = entrada.split("\n");
    card = lineas[0].split(" ");
	
    let rojo = parseInt(card[0]);
    let verde = parseInt(card[1]);
    let azul = parseInt(card[2]);

    const veces = parseInt(lineas[1]);
    let encontrado = 0;

    function duplicar(posicion) {
        card[posicion] = card[posicion] * 2;
    }

    function duplicarDesde(destino, origen) {
        card[destino] = card[origen] * 2;
    }

    function enOrden() {
        let primeraComparacion = card[0] < card[1];
        let segundaComparacion = card[1] < card[2];
        return primeraComparacion && segundaComparacion;
    }

    function restaurar() {
        card[0] = rojo;
        card[1] = verde;
        card[2] = azul;
    }

    if (veces == 1) {
        for( let x=0; x < 3 ; x++){
            duplicar(x);

            if(enOrden()) {
                encontrado = 1;
                console.log( "Yes" );
                break;
            }

            restaurar();
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if(veces == 2){
        for( let x=0; x < 3 ; x++){
            for (let y=0; y < 3 ; y++){
                duplicar(x);
                duplicar(y);

                if(enOrden()) {
                    encontrado = 1;
                    break;
                }

                restaurar();
            }
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }

    } else if (veces == 3){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    duplicar(x);
                    duplicar(y);
                    duplicar(z);
                  
                    if(enOrden()) {
                        encontrado = 1;
                        break;
                    }

                    restaurar();
                }
            }
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (veces == 4){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        duplicar(x);
                        duplicar(y);
                        duplicar(z);
                        duplicar(s);
    
                        if(enOrden()) {
                            encontrado = 1;
                            break;
                        }

                        restaurar();
                    }
                }
            }
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (veces == 5){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        for (let t=0; t<3 ; t++){
                            duplicar(x);
                            duplicar(y);
                            duplicar(z);
                            duplicar(s);
                            duplicarDesde(t, s);
        
                            if(enOrden()) {
                                encontrado = 1;
                                break;
                            }

                            restaurar();
                        }
                    }
                }
            }
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (veces==6){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        for (let t=0; t<3 ; t++){
                            for (let u=0; u<3 ; u++){
                                duplicar(x);
                                duplicar(y);
                                duplicar(z);
                                duplicar(s);
                                duplicarDesde(t, s);
                                duplicar(u);
            
                                if(enOrden()) {
                                    encontrado = 1;
                                    break;
                                }

                                restaurar();
                            }
                            
                        }
                    
                    }
                }
            }
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }else if (veces==7){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        for (let t=0; t<3 ; t++){
                            for (let u=0; u<3 ; u++){
                                for (let v=0; v<3 ;v++){

                                    duplicar(x);
                                    duplicar(y);
                                    duplicar(z);
                                    duplicar(s);
                                    duplicarDesde(t, s);
                                    duplicar(u);
                                    duplicarDesde(v, u);
                
                                    if(enOrden()) {
                                        encontrado = 1;
                                        break;
                                    }

                                    restaurar();
                                }

                            }
                            
                        }
                    
                    }
                }
            }
        }
        if(encontrado==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Resolver(require("fs").readFileSync("/dev/stdin", "utf8"));
