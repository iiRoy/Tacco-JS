function displayElapsedTime(timeValue) {
    const totalSeconds = parseInt(timeValue, 10);
    const momentInTime = new Date(totalSeconds * 1000);

    const hourComponent = momentInTime.getUTCHours();
    const minuteComponent = momentInTime.getUTCMinutes();
    const secondComponent = momentInTime.getUTCSeconds();

    const outputParts = [hourComponent, minuteComponent, secondComponent];
    console.log(outputParts.join(':'));
}

displayElapsedTime(require("fs").readFileSync("/dev/stdin", "utf8"));