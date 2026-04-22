function Main(input) {

    input = input.split("\n");
    card = input[0].split(" ");
	
    let red = parseInt(card[0]);
    let green = parseInt(card[1]);
    let blue = parseInt(card[2]);

    const k = parseInt(input[1]);
    let i = 0;

    if (k == 1) {
        for( let x=0; x < 3 ; x++){
            card[x] = card[x] * 2;

            if(card[0]<card[1] && card[1]<card[2]) {
                i = 1;
                console.log( "Yes" );
                break;
            }

            card[0] = red;
            card[1] = green;
            card[2] = blue;
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if(k == 2){
        for( let x=0; x < 3 ; x++){
            for (let y=0; y < 3 ; y++){
                card[x] = card[x] * 2;
                card[y] = card[y] * 2;

                if(card[0]<card[1] && card[1]<card[2]) {
                    i = 1;
                    break;
                }

                card[0] = red;
                card[1] = green;
                card[2] = blue;
            }
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }

    } else if (k == 3){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    card[x] = card[x] * 2;
                    card[y] = card[y] * 2;
                    card[z] = card[z] * 2;
                  
                    if(card[0]<card[1] && card[1]<card[2]) {
                        i = 1;
                        break;
                    }

                    card[0] = red;
                    card[1] = green;
                    card[2] = blue;
                }
            }
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (k == 4){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        card[x] = card[x] * 2;
                        card[y] = card[y] * 2;
                        card[z] = card[z] * 2;
                        card[s] = card[s] * 2;
    
                        if(card[0]<card[1] && card[1]<card[2]) {
                            i = 1;
                            break;
                        }

                        card[0] = red;
                        card[1] = green;
                        card[2] = blue;
                    
                    }
                }
            }
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (k == 5){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        for (let t=0; t<3 ; t++){
                            card[x] = card[x] * 2;
                            card[y] = card[y] * 2;
                            card[z] = card[z] * 2;
                            card[s] = card[s] * 2;
                            card[t] = card[s] * 2;
        
                            if(card[0]<card[1] && card[1]<card[2]) {
                                i = 1;
                                break;
                            }

                            card[0] = red;
                            card[1] = green;
                            card[2] = blue;
                        }
                    }
                }
            }
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (k==6){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        for (let t=0; t<3 ; t++){
                            for (let u=0; u<3 ; u++){
                                card[x] = card[x] * 2;
                                card[y] = card[y] * 2;
                                card[z] = card[z] * 2;
                                card[s] = card[s] * 2;
                                card[t] = card[s] * 2;
                                card[u] = card[u] * 2;
            
                                if(card[0]<card[1] && card[1]<card[2]) {
                                    i = 1;
                                    break;
                                }

                                card[0] = red;
                                card[1] = green;
                                card[2] = blue;
                            }
                            
                        }
                    
                    }
                }
            }
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }else if (k==7){
        for ( let x=0; x < 3 ; x++){
            for ( let y=0; y < 3 ; y++) {
                for ( let z=0; z < 3 ; z++) {
                    for (let s=0; s < 3 ; s++){
                        for (let t=0; t<3 ; t++){
                            for (let u=0; u<3 ; u++){
                                for (let v=0; v<3 ;v++){

                                    card[x] = card[x] * 2;
                                    card[y] = card[y] * 2;
                                    card[z] = card[z] * 2;
                                    card[s] = card[s] * 2;
                                    card[t] = card[s] * 2;
                                    card[u] = card[u] * 2;
                                    card[v] = card[u] * 2;
                
                                    if(card[0]<card[1] && card[1]<card[2]) {
                                        i = 1;
                                        break;
                                    }

                                    card[0] = red;
                                    card[1] = green;
                                    card[2] = blue;
                                }

                            }
                            
                        }
                    
                    }
                }
            }
        }
        if(i==1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));