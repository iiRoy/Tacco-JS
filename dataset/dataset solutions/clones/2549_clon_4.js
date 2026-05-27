function forecastTransition(currentClimate) {
    const climateCycle = new Map([
        ['Sunny', 'Cloudy'],
        ['Cloudy', 'Rainy'],
        ['Rainy', 'Sunny']
    ]);
    const subsequentClimate = climateCycle.get(currentClimate) || 'Other';
    console.log(subsequentClimate);
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
}
