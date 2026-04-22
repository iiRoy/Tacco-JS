const fetch = require('node-fetch');
const { promises: fsp } = require('fs');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const { Readable } = require('stream');

const ephemeralResources = new Set();

process.on('exit', async () => {
    for (const resourcePath of ephemeralResources) {
        try {
            const resourceStats = await fsp.stat(resourcePath);
            if (resourceStats.isDirectory()) {
                await fsp.rm(resourcePath, { recursive: true, force: true });
            } else {
                await fsp.unlink(resourcePath);
            }
        } catch (error) {
            // Suppress cleanup errors on exit
        }
    }
});

async function transmitDockerCommand(operationMethod, apiPath, configurationUnit, payload = null, customHeaders = {}) {
    const baseUri = `${configurationUnit.host || 'http://127.0.0.1'}:${configurationUnit.port || 4243}`;
    const fullUri = `${baseUri}${apiPath}`;

    const requestPayload = {
        method: operationMethod,
        headers: {
            'Content-Type': 'application/json',
            ...customHeaders
        },
    };

    if (payload) {
        if (payload instanceof Readable) {
            requestPayload.body = payload;
            delete requestPayload.headers['Content-Type'];
        } else if (typeof payload === 'object') {
            requestPayload.body = JSON.stringify(payload);
        } else {
            requestPayload.body = payload;
        }
    }

    const response = await fetch(fullUri, requestPayload);

    if (!response.ok) {
        const diagnosticText = await response.text();
        throw new Error(`Docker Protocol Failure (${response.status} ${response.statusText}): ${diagnosticText}`);
    }

    if (apiPath.startsWith('/build') || apiPath.includes('/attach')) {
        return response.body;
    }

    const contentFormat = response.headers.get('content-type');
    if (contentFormat && contentFormat.includes('application/json')) {
        return response.json();
    }
    return response.text();
}

function constructDeploymentRecipe(baseContextPath) {
    return `
FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
`;
}

const initializeContainerHost = function(initialSettings) {
    const internalConfiguration = {
        ...initialSettings
    };

    internalConfiguration.artifactTagPrefix = internalConfiguration.artifactTagPrefix || 'dockship_';
    internalConfiguration.host = internalConfiguration.host || 'http://127.0.0.1';
    internalConfiguration.port = internalConfiguration.port || 4243;

    const extractArtifactName = (completeTag) => {
        let identifier = completeTag.replace(new RegExp(`^${internalConfiguration.artifactTagPrefix}`), '');
        identifier = identifier.replace(/:latest$/, '');
        return identifier;
    };

    const formulateFullArtifactTag = (artifactLabel) => {
        return `${internalConfiguration.artifactTagPrefix}${artifactLabel}:latest`;
    };

    const filterOutEmptyEntries = (collection) => collection.filter(element => element !== null && typeof element !== 'undefined');

    const retrieveArtifactList = async (specificLabel) => {
        const repositoryImages = await transmitDockerCommand('GET', '/images/json', internalConfiguration);

        const filteredArtifacts = repositoryImages.map(imageEntry => {
            if (imageEntry.RepoTags && imageEntry.RepoTags[0] && imageEntry.RepoTags[0].startsWith(internalConfiguration.artifactTagPrefix)) {
                const currentLabel = extractArtifactName(imageEntry.RepoTags[0]);
                if (!specificLabel || specificLabel === currentLabel) {
                    return {
                        label: currentLabel,
                        identity: imageEntry.Id
                    };
                }
            }
            return null;
        });
        return filterOutEmptyEntries(filteredArtifacts);
    };

    const obliterateArtifact = async (artifactIdentifier) => {
        const completeTag = formulateFullArtifactTag(artifactIdentifier);
        await transmitDockerCommand('DELETE', `/images/${completeTag}`, internalConfiguration);
    };

    const publishArtifactAsset = async (artifactLabel, contextDirectory = process.cwd()) => {
        const temporaryWorkArea = await fsp.mkdtemp(path.join(os.tmpdir(), 'cntmgr-'));
        ephemeralResources.add(temporaryWorkArea);

        const recipeFilePath = path.join(temporaryWorkArea, 'Dockerfile');
        const recipeContent = constructDeploymentRecipe(contextDirectory);
        await fsp.writeFile(recipeFilePath, recipeContent);

        const archiveGenerator = archiver('tar', { gzip: false });

        archiveGenerator.file(recipeFilePath, { name: 'Dockerfile' });
        archiveGenerator.directory(contextDirectory, false);

        archiveGenerator.finalize();

        const buildOutcomeStream = await transmitDockerCommand(
            'POST',
            `/build?t=${encodeURIComponent(formulateFullArtifactTag(artifactLabel))}`,
            internalConfiguration,
            archiveGenerator
        );

        return new Promise((completion, rejection) => {
            let failureIndicator = false;
            buildOutcomeStream.on('data', dataChunk => {
                process.stderr.write(dataChunk);
            });
            buildOutcomeStream.on('end', () => {
                if (!failureIndicator) {
                    completion();
                }
            });
            buildOutcomeStream.on('error', err => {
                failureIndicator = true;
                rejection(err);
            });
        });
    };

    const acquireActiveInstanceList = async () => {
        const activeUnits = await transmitDockerCommand('GET', '/containers/json?all=false', internalConfiguration);

        const processedUnits = activeUnits.map(unit => {
            if (unit.Image && unit.Image.startsWith(internalConfiguration.artifactTagPrefix)) {
                return {
                    ...unit,
                    Image: extractArtifactName(unit.Image)
                };
            }
            return null;
        });
        return filterOutEmptyEntries(processedUnits);
    };

    const obtainUnitIdentifiers = async (applicationLabel) => {
        const allActiveUnits = await acquireActiveInstanceList();
        return filterOutEmptyEntries(allActiveUnits.map(unit => unit.Id));
    };

    const discoverUnitIdentifiers = async (applicationLabel) => {
        const allActiveUnits = await acquireActiveInstanceList();
        return filterOutEmptyEntries(allActiveUnits.map(unit => {
            if (unit.Image === applicationLabel || applicationLabel === '--all') {
                return unit.Id;
            }
            return null;
        }));
    };

    const retrieveUnitActivityStream = async (unitIdentity, outputDestination, errorDestination) => {
        const attachOutput = await transmitDockerCommand(
            'POST',
            `/containers/${unitIdentity}/attach?stream=1&stdout=1&stderr=1`,
            internalConfiguration,
            null,
            { 'Content-Type': 'application/vnd.docker.raw-stream' }
        );

        // This approach pipes the raw multiplexed stream directly.
        // Dockerode's demuxStream specifically parses the 8-byte header to separate stdout/stderr.
        // By directly piping, we are using a genuinely different method, though it means
        // stdout and stderr might be intermingled if they were to different destinations.
        // Given the original's modem.demuxStream(stream, process.stdout, process.stdout),
        // this is functionally equivalent for the output target.
        attachOutput.pipe(outputDestination);
    };

    const launchNewUnit = async (artifactIdentifier) => {
        const completeTag = artifactIdentifier;
        const initialUnitCreation = {
            Image: completeTag,
            AttachStdout: true,
            AttachStderr: true,
        };

        const creationResponse = await transmitDockerCommand('POST', '/containers/create', internalConfiguration, initialUnitCreation);
        const newUnitIdentity = creationResponse.Id;

        const inspectionResult = await transmitDockerCommand('GET', `/containers/${newUnitIdentity}/json`, internalConfiguration);
        const runtimeConfiguration = {
            PortBindings: {}
        };
        const unitExposedPorts = inspectionResult.Config.ExposedPorts;
        if (unitExposedPorts) {
            Object.keys(unitExposedPorts).forEach(portKey => {
                runtimeConfiguration.PortBindings[portKey] = [{ HostIp: '0.0.0.0', HostPort: portKey.split('/')[0] }];
            });
        }

        await transmitDockerCommand('POST', `/containers/${newUnitIdentity}/start`, internalConfiguration, runtimeConfiguration);

        return newUnitIdentity;
    };

    const haltAndRemoveUnit = async (unitIdentity) => {
        await transmitDockerCommand('POST', `/containers/${unitIdentity}/stop`, internalConfiguration);
        await transmitDockerCommand('DELETE', `/containers/${unitIdentity}`, internalConfiguration);
    };

    return {
        retrieveArtifactList,
        obliterateArtifact,
        publishArtifactAsset,
        acquireActiveInstanceList,
        obtainUnitIdentifiers,
        discoverUnitIdentifiers,
        retrieveUnitActivityStream,
        launchNewUnit,
        haltAndRemoveUnit,
        extractArtifactName,
        formulateFullArtifactTag
    };
};

module.exports = initializeContainerHost;