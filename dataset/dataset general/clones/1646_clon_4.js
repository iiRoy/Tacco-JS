const fileSystem = require("fs");

const checkDirectory = "tests";
const moduleSuffix = ".js";

const allItems = fileSystem.readdirSync(checkDirectory);

const processModule = (moduleKey) => {
    describe(moduleKey, () => {
        it('should validate module', () => {
            require("./" + checkDirectory + "/" + moduleKey);
        });
    });
};

allItems
    .filter(item => item.endsWith(moduleSuffix))
    .forEach(processModule);