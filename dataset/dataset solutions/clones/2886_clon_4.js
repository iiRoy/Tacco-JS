function run(source) {
    const raw = source.trim();
    const sides = parseInt(raw, 10);

    function accumulateAngle(times) {
        if (Number.isNaN(times)) {
            return NaN;
        }
        if (!Number.isFinite(times)) {
            return times * 180;
        }

        let angle = 0;
        let remaining = Math.abs(times);
        while (remaining > 0) {
            angle += 180;
            remaining--;
        }
        return times < 0 ? -angle : angle;
    }

    const triangles = sides - 2;
    console.log(accumulateAngle(triangles));
}

run(require('fs').readFileSync('/dev/stdin', 'utf8'));
