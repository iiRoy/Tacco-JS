const diskOps = require("fs");
const pathUtil = require("path");
const systemBootstrapper = require("./squarespace-server");

async function orchestrateStartup() {
    const currentDirectory = process.cwd();
    const configurationSource = pathUtil.resolve(currentDirectory, "template.conf");

    const incomingParameters = Array.from(process.argv).filter((_, position) => position > 1);

    const acquireSettings = (sourcePath) => {
        return new Promise((completion, failure) => {
            diskOps.readFile(sourcePath, "utf8", (errorCondition, contentData) => {
                if (errorCondition) {
                    return failure(new Error(`Data retrieval failed: ${errorCondition.message}`));
                }
                try {
                    const parsedData = JSON.parse(contentData);
                    completion(parsedData);
                } catch (parsingError) {
                    failure(new Error(`Data interpretation failed: ${parsingError.message}`));
                }
            });
        });
    };

    try {
        const processedConfiguration = await acquireSettings(configurationSource);
        systemBootstrapper.init(processedConfiguration, incomingParameters);
    } catch (processingIssue) {
        console.error("Application initialization error:", processingIssue.message);
        process.exit(1);
    }
}

orchestrateStartup();