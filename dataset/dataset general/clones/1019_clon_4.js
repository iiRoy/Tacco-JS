const n_path = require('path');
const n_yml = require('js-yaml');
const n_filsys = require('fs');

const typeHandlers = {
    '.yml': (inputLoc) => n_yml.safeLoad(n_filsys.readFileSync(inputLoc, 'utf8')),
    '.yaml': (inputLoc) => n_yml.safeLoad(n_filsys.readFileSync(inputLoc, 'utf8')),
    '.json': (inputLoc) => require(inputLoc),
    '.js': (inputLoc) => require(inputLoc),
    '.coffee': (inputLoc) => require(inputLoc),
    '.ls': (inputLoc) => require(inputLoc)
};

const obtainConfiguration = (resourcePath) => {
    if (!n_filsys.existsSync(resourcePath)) {
        throw new Error(`The specified resource '${resourcePath}' does not exist.`);
    }

    const fileExtension = n_path.extname(resourcePath);

    const handlerFunction = typeHandlers[fileExtension];

    if (handlerFunction) {
        return handlerFunction(resourcePath);
    } else {
        throw new Error(`Cannot process '${resourcePath}': unrecognized file format.`);
    }
};

module.exports = obtainConfiguration;