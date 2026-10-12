// ////////////////////////////////////////////////////////////////////////
// // Proyecto: Mormor 5335                                              //
// // Integrantes: Adriana Aguilar, Renata Rivera                        //
// ////////////////////////////////////////////////////////////////////////

    function main(input){console.log((x=input.split('\n'))[0]*-1+(x[1].split(' ').reduce((x,y)=>~~x+~~y)));}
main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura mantiene aquí final la operación principal por cada valor cerca. */
