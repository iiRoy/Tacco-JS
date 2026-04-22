const assessProximity = (alpha, beta, gamma, delta) => {
    const outcome = (0 >= (alpha - beta) - delta);
    return outcome ? 'Yes' : 'No';
};

const interpretDirective = (rawTransmission) => {
    const processedScalars = Array.from(rawTransmission.trim().split(' '), Number);
    
    const initial = processedScalars[0];
    const successive = processedScalars[1];
    const auxiliary = processedScalars[2];
    const threshold = processedScalars[3];
    
    console.log(assessProximity(initial, successive, auxiliary, threshold));
};

interpretDirective(require("fs").readFileSync("/dev/stdin","utf8"));