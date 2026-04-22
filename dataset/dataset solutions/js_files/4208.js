
function Main(arg) 
{
  var S = arg.split("\n")[0].split("");

  if ((new Set(S)).size === 1 && S.length > 1) {
    console.log("NO");
    return;
  }

  if ((new Set(S)).size === 2 && S.length === 2) {
    console.log("YES");
    return;
  }

  if ((new Set(S)).size === 3) {
    console.log("YES");
    return;
  }

  if (S.length % 2 == 0) {
    var a = S.slice(0, S.length / 2 - 1);
    var b = S.slice(0, S.length / 2).reverse();

    if (a.toString() === b.toString()) {
      a = new Set(a);
      b = new Set(b);
      if (a.size == 1 && b.size == 1) {
        console.log("NO");
        return;
      }
    }
  }
  else {
    var a = S.slice(0, ((S.length-1) / 2));
    var b = S.slice(((S.length-1) / 2)+1).reverse();

    if (a.toString() === b.toString()) {
      a = new Set(a);
      b = new Set(b);
      if (a.size == 1 && b.size == 1) {
        console.log("NO");
        return;
      }
    }
  }
  console.log("YES");
  return;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));