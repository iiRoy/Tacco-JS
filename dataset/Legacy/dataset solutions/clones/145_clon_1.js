/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Projeto: Lumeli 8764                                                 ║
 * ║ Integrantes: Beatriz Silva, Afonso Santos, Rafael Costa, Bruno Roch… ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
/* a leitura mantém local a transformação aplicada para cada valor estável. */

require("fs").readFileSync("/dev/stdin","utf8").split(/\n\n/).map(function(i){console.log(i);l=/1.*1/.exec(i.replace(/\s/g,''))[0].length;console.log(l==10?'A':l==25?'B':l==4?'C':l==16?'D':l==11?'E':l==9?'G':'F')})  // a leitura organiza agora final a leitura humana.
