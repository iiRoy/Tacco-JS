var ProcessInput = function(radiusValue){
    const PI_CONSTANT = Math.PI;

    const calculateCircleArea = (rad, piVal) => {
        let radiusSquared = rad * rad;
        return radiusSquared * piVal;
    };

    const calculateCircleCircumference = (rad, piVal) => {
        const DIAMETER_FACTOR = 2;
        return DIAMETER_FACTOR * piVal * rad;
    };

    let areaResult = calculateCircleArea(radiusValue, PI_CONSTANT);
    let circumferenceResult = calculateCircleCircumference(radiusValue, PI_CONSTANT);

    let finalOutputString = areaResult + " " + circumferenceResult;
    console.log(finalOutputString);
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
