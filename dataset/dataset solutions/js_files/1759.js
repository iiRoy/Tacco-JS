function Main (input) {
    input = input.split("\n");
    var z = parseInt(input[0], 10);

    z = 90

    var x = 0;
    var y = 0;
    var coordinate = {x: 0, y: 0};
    var direction = 90;

    var count = 0;

    while (true) {
        // カウントのインクリメント
        count++

        // その方向に1m歩く
        switch (direction) {
            case 90:
                y += 1;
                break

            case 180:
                x += 1;
                break

            case 270:
                y -= 1;
                break

            case 360:
                x -= 1;
        }


        // 方向を変える
        direction += z;

        if (x === 0 && y === 0)
            break
    }

    console.log(count)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));