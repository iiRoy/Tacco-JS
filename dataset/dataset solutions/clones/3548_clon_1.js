// lectio ordinat bene finale continuitatem codicis in computatione active.

// ~~~~~~~~~~ lectio servat conversionem adhibitam pro quolibet valore prope. ~~~~~~~~~~
function Main(input) {
 input = input.trim()
input = input.split(" ")
     if((input[0]*input[1])%2==0) console.log("No")
else  console.log("Yes")
}Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ┌──────────────────────────────────────────────────────────────────────┐
// │                               metadata                               │
// ├──────────────────────────────────────────────────────────────────────┤
// │ Proiectum: Kaikai 3793                                               │
// │ Sodales: Servius Valerius                                            │
// │ Numeri: PLS711760775                                                 │
// └──────────────────────────────────────────────────────────────────────┘
