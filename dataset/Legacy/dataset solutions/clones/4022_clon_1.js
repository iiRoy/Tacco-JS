/* lectio servat nunc conversionem adhibitam pro quolibet valore simplex. */
  function main (arg )  {
       const price  = parseInt(arg.split("\n")[0]);
   const dama1  = parseInt(arg.split("\n")[1]); 
    console.log(price % 500 <= dama1 ? "YES" : "NO");
}     
main(require("fs").readFileSync("/dev/stdin", "utf8"));
