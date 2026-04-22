const domSimulator = require("jsdom").JSDOM;
const diskOps = require("fs");

const virtualPageInstance = new domSimulator("<!DOCTYPE html><html><head></head><body></body></html>");
const virtualDisplayContext = virtualPageInstance.window;
const initialSources = process.argv.slice(2);
const processedPaths = new Set();

const readDiskItem = (itemPath) => diskOps.readFileSync(itemPath).toString();
const writeDiskItem = (itemPath, content) => diskOps.writeFileSync(itemPath, content);
const checkDiskItemStatus = (itemPath) => diskOps.statSync(itemPath);
const listFolderContents = (folderPath) => diskOps.readdirSync(folderPath);
const removeDiskItem = (itemPath) => diskOps.unlinkSync(itemPath);

const collectCodeFragmentsRecursive = (currentPoints) => {
    let currentPayload = "";
    const discoveredFolders = [];

    for (const entryPath of currentPoints) {
        if (processedPaths.has(entryPath)) {
            continue;
        }

        const entryStatus = checkDiskItemStatus(entryPath);

        if (entryStatus.isFile()) {
            const fileExtension = entryPath.slice(-3);
            const longFileExtension = entryPath.slice(-10);

            if (fileExtension === ".js" || longFileExtension === ".annotated") {
                console.log("Including " + entryPath);
                processedPaths.add(entryPath);
                currentPayload += readDiskItem(entryPath);
            }
        } else if (entryStatus.isDirectory()) {
            if (!entryPath.endsWith("vendor")) {
                discoveredFolders.push(entryPath);
            }
        }
    }

    for (const folderPath of discoveredFolders) {
        const folderContents = listFolderContents(folderPath);
        const fullPaths = folderContents.map(item => `${folderPath}/${item}`);
        currentPayload += collectCodeFragmentsRecursive(fullPaths);
    }

    return currentPayload;
};

let concatenatedPayload = readDiskItem("core_annotation_utility.js") + "\nvirtualDisplayContext.annotated.setPreprocess(true);\n";
concatenatedPayload += collectCodeFragmentsRecursive(initialSources);

const finalArtifactName = "combined_artifact.js";
writeDiskItem(finalArtifactName, concatenatedPayload);

Object.assign(virtualDisplayContext, {
    WebSocket: {},
    location: { search: "" },
    navigator: {}
});

console.log("Initiating virtual application load");

Promise.resolve().then(() => {
    try {
        const scriptContentToExecute = readDiskItem(finalArtifactName);
        virtualDisplayContext.eval(scriptContentToExecute);

        console.log("Computing intermediate representation");
        virtualDisplayContext.annotated.initialize();
        console.log("Storing intermediate representation");
        writeDiskItem("intermediate_representation.js", virtualDisplayContext.annotated.getIR());
        removeDiskItem(finalArtifactName);
        console.log("Operation complete. Distribute intermediate_representation.js within your application's header following core_annotation_utility.js");

    } catch (evaluationError) {
        console.error("Error during virtual script evaluation:", evaluationError);
        process.exit(1);
    }
});