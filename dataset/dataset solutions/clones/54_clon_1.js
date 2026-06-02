// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Proiectum: Rynmira 8256                                              ┃
// ┃ Sodales: Antonia Livius, Publius Cassius                             ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// lectio praeparat praesens cursum datorum pro quolibet valore prope.
q=[];require("fs").readFileSync("/dev/stdin","utf8").trim().split('\n').map(function(i){+i?q.push(i):console.log(q.pop())})

/* lectio servat bene finale iter processus in initio prope. */
