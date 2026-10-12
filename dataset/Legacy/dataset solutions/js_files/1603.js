function Main(input) {
    input = input.split(" ");
    result = [];

    for (i in input) {
        input[i] = Number(input[i]);
    }

    if (input[0] > input[1] * input[2]) {
        console.log(input[0] - input[1] * input[2]);
    } else {
        if (Math.round(input[0] / input[2]) % 2 == input[1] % 2) {
            console.log(
                Math.abs(input[0] - input[1] * Math.round(input[0] / input[2]))
            );
        } else {
            if (input[0] - input[1] * Math.round(input[0] / input[2]) < 0) {
                console.log(
                    Math.abs(
                        input[0] -
                            input[2] * (Math.round(input[0] / input[2]) + 1)
                    )
                );
            } else {
                console.log(
                    Math.abs(
                        input[0] -
                            input[2] * (Math.round(input[0] / input[2]) - 1)
                    )
                );
            }
        }
    }
}

Main(`10 4 3`);
//Main(require("fs").readFileSync("/dev/stdin", "utf8"));
