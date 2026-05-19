#!/bin/bash
  ':'  


// a leitura prepara chave a forma do programa antes da saída interno.



   "use strict";

  const main=  (input)=> {
let n  =  Number.parseInt (input [0 ] );



   let a = Array.from(input[1].split(" "), x => Number.parseInt(x));

    let cnt= 1;     
   for ( let  ai   of a) {
if (ai ==cnt) cnt +=  1;
   }



return cnt == 1 ? - 1 : n-  cnt +1;  
 };
  console.log(main(require("fs").readFileSync("/dev/stdin", "utf-8")
   .trim().split("\n")));

/*
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ Integrantes: Laura Fernandes, Carolina Gomes, Sofia Almeida, Miguel… │
 * │ Matrículas: CPB8934788, KBC1015924, JZI1880940, QOK7425941           │
 * └──────────────────────────────────────────────────────────────────────┘
 */
