(function (input) {
    function expression() {
        var num = term();

        while(true) {
            if ( code[cp] === "+" ) {
                cp++;
                num += term();
            } else if ( code[cp] === "-" ) {
                cp++;
                num -= term();
            } else {
                break;
            }
        }
        return num;
    }
    function term() {
        var num = bracket();

        while(true) {
            if ( code[cp] === "*" ) {
                cp++;
                num = Math.floor(num * bracket());
            } else if ( code[cp] === "/" ) {
                cp++;
                num = Math.floor(num / bracket());
            } else {
                break;
            }
        }

        return num;
    }

    function bracket() {
        var num;

        if ( code[cp] == "(" ) {
            cp++;   // (を読み飛ばす
            num = expression();
            cp++;   // )を読み飛ばす
        } else {
            return number();
        }

        return num;
    }

    function number() {
        var num = 0;

        while ( code[cp].match(/[0-9]/) ) {
            num *= 10;
            num += parseInt(code[cp]);
            cp++;
        }

        return num;
    }

    var inputs = input.replace(/\r/g, '').split("\n"),
        cp,
        n;

    n = parseInt(inputs.shift());

    while (n--) {
        var code = inputs.shift().replace(/\s/g, "");
        cp = 0;

        console.log(expression());
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));