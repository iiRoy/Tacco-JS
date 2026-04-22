const disk = require('fs');
const route = require('path');
const streamPipe = require('through2');
const utilityKit = require('gulp-util');
const ToolFault = utilityKit.PluginError;
const blend = require('node.extend');

const blueprintDetails = require('./package.json');

const baseSettings = {
    commentMarkers: true,
    verboseOutput: false
};

const silentOperation = function () { };

let activeSettings;
let relayMessage = silentOperation;

const directivePatterns = {
    mainBlueprint: /<!--\s*@@main\s*[\=\s]\s*(\S+)\s*(?:([^-]+)\s*)?-->/,
    embedFragment: /<!--\s*@@embed\s*[\=\s]\s*(\S+)\s*(?:([^-]+)\s*)?-->/,
    contentSlot: /<!--\s*@@slot\s*[\=\s]\s*(\S+)\s*-->/,
    variableParam: /<!--\s*@@param\s*[\=\s]\s*([^\s]+)\s*-->/,
    sectionBegin: /<!--\s*@@section\s*[\=\s]\s*(\S+)\s*-->/,
    sectionEnd: /<!--\s*@@endsection\s*-->/
};

/**
 * Main module export for the assembly tool.
 * @param {object} customSettings - User-defined settings.
 * @returns {stream.Transform} A Gulp-compatible transform stream.
 */
module.exports = function buildTool(customSettings) {

    activeSettings = blend({}, baseSettings, customSettings || {});

    if (activeSettings.verboseOutput) {
        relayMessage = utilityKit.log;
    }

    const resourceCache = new Map();

    return streamPipe.obj(async function (element, encoding, callback) {

        if (element.isNull()) {
            return callback(null, element);
        }

        if (element.isStream()) {
            return callback(new ToolFault(blueprintDetails.name, 'Stream processing is not supported'));
        }

        if (element.isBuffer()) {
            try {
                const initialResource = new AssemblyUnit(element);
                const finalResource = await composeResource(initialResource, activeSettings, resourceCache);
                element.contents = Buffer.from(finalResource.payload);
                return callback(null, element);
            } catch (err) {
                return callback(new ToolFault(blueprintDetails.name, err.message));
            }
        }
    });
};

/**
 * Represents a document or file being processed internally.
 */
class AssemblyUnit {
    constructor(gulpFile) {
        this.unitId = gulpFile.path;
        this.originPath = gulpFile.path;
        this.basePath = gulpFile.base;
        this.payload = gulpFile.contents.toString('utf8');
    }
}

/**
 * Reads a resource from disk and creates an AssemblyUnit.
 * @param {string} absoluteLocation - Absolute path to the resource.
 * @param {object} runtimeConfiguration - Current configuration.
 * @returns {Promise<AssemblyUnit>} A promise that resolves to an AssemblyUnit.
 */
async function constructResource(absoluteLocation, runtimeConfiguration) {
    relayMessage('[Constructing resource]', absoluteLocation);
    const content = await disk.promises.readFile(absoluteLocation, 'utf8');
    // Create a temporary Gulp file object to wrap for AssemblyUnit
    const tempGulpFile = new utilityKit.File({
        base: route.dirname(absoluteLocation),
        path: absoluteLocation,
        contents: Buffer.from(content)
    });
    return new AssemblyUnit(tempGulpFile);
}

/**
 * Main recursive function to process a resource, resolving embeds and master blueprints.
 * @param {AssemblyUnit} currentResource - The resource to process.
 * @param {object} runtimeConfiguration - Current configuration.
 * @param {Map<string, AssemblyUnit>} resourceCache - Cache for processed resources.
 * @returns {Promise<AssemblyUnit>} A promise that resolves to the fully processed AssemblyUnit.
 */
async function composeResource(currentResource, runtimeConfiguration, resourceCache) {
    relayMessage('[Initiating composition]', currentResource.unitId);

    let processedWithEmbeds = await embedFragments(currentResource, runtimeConfiguration, resourceCache);

    const blueprintDetails = locateBlueprint(processedWithEmbeds.payload);

    if (!blueprintDetails) {
        relayMessage('[No main blueprint found]', processedWithEmbeds.unitId);
        return processedWithEmbeds;
    }

    const blueprintLocation = blueprintDetails.target;
    relayMessage('[Found main blueprint]', blueprintLocation);

    if (!blueprintLocation) {
        return processedWithEmbeds;
    }

    const absoluteBlueprintLocation = resolveResourcePath(currentResource.originPath, blueprintLocation, runtimeConfiguration.root);

    if (resourceCache.has(absoluteBlueprintLocation)) {
        relayMessage('[Using cached blueprint]', absoluteBlueprintLocation);
        const cachedBlueprint = resourceCache.get(absoluteBlueprintLocation);
        const finalContent = applyChildComponents(
            cachedBlueprint.payload,
            processedWithEmbeds.payload,
            blueprintDetails.parameters,
            runtimeConfiguration
        );
        // Return a new AssemblyUnit representing the current file's final state
        return new AssemblyUnit(new utilityKit.File({
            base: currentResource.basePath,
            path: currentResource.unitId,
            contents: Buffer.from(finalContent)
        }));
    }

    const masterResource = await constructResource(absoluteBlueprintLocation, runtimeConfiguration);
    const fullyComposedMaster = await composeResource(masterResource, runtimeConfiguration, resourceCache);

    resourceCache.set(absoluteBlueprintLocation, fullyComposedMaster);

    const finalContent = applyChildComponents(
        fullyComposedMaster.payload,
        processedWithEmbeds.payload,
        blueprintDetails.parameters,
        runtimeConfiguration
    );

    return new AssemblyUnit(new utilityKit.File({
        base: currentResource.basePath,
        path: currentResource.unitId,
        contents: Buffer.from(finalContent)
    }));
}

/**
 * Resolves @@embed directives in a resource's content.
 * @param {AssemblyUnit} currentResource - The resource to process.
 * @param {object} runtimeConfiguration - Current configuration.
 * @param {Map<string, AssemblyUnit>} resourceCache - Cache for processed resources.
 * @returns {Promise<AssemblyUnit>} A promise that resolves to a new AssemblyUnit with embeds resolved.
 */
async function embedFragments(currentResource, runtimeConfiguration, resourceCache) {
    relayMessage('[Embedding fragments for]', currentResource.unitId);
    const contentLines = segmentByNewline(currentResource.payload);

    const processedLines = await Promise.all(contentLines.map(async (line) => {
        const fragmentDetails = locateFragment(line);

        if (fragmentDetails && fragmentDetails.target) {
            const fragmentLocation = fragmentDetails.target;
            const absoluteFragmentLocation = resolveResourcePath(currentResource.originPath, fragmentLocation, runtimeConfiguration.root);

            relayMessage('[Embedding fragment]', absoluteFragmentLocation);

            let embeddedResource;
            if (resourceCache.has(absoluteFragmentLocation)) {
                embeddedResource = resourceCache.get(absoluteFragmentLocation);
                relayMessage('[Using cached fragment]', absoluteFragmentLocation);
            } else {
                const rawFragment = await constructResource(absoluteFragmentLocation, runtimeConfiguration);
                embeddedResource = await embedFragments(rawFragment, runtimeConfiguration, resourceCache);
                resourceCache.set(absoluteFragmentLocation, embeddedResource);
            }

            let fragmentContent = embeddedResource.payload;

            if (fragmentDetails.parameters) {
                fragmentContent = substituteParameters(fragmentContent, fragmentDetails.parameters);
            }

            if (runtimeConfiguration.commentMarkers) {
                return [
                    `<!-- start ${route.basename(absoluteFragmentLocation)}-->`,
                    fragmentContent,
                    `<!-- end ${route.basename(absoluteFragmentLocation)}-->`
                ].join('\n');
            } else {
                return fragmentContent;
            }
        } else {
            return line;
        }
    }));

    const newContent = processedLines.join('\n');
    // Return a new AssemblyUnit as we've transformed the content
    return new AssemblyUnit(new utilityKit.File({
        base: currentResource.basePath,
        path: currentResource.unitId,
        contents: Buffer.from(newContent)
    }));
}

/**
 * Applies components (blocks) from a child resource to a master resource's content.
 * @param {string} masterContent - The content of the master resource.
 * @param {string} childContent - The content of the child resource (where blocks are defined).
 * @param {object} masterParameters - Parameters for the master template itself.
 * @param {object} runtimeConfiguration - Current configuration.
 * @returns {string} The master content with placeholders replaced by child components.
 */
function applyChildComponents(masterContent, childContent, masterParameters, runtimeConfiguration) {
    const componentMap = extractComponents(childContent, runtimeConfiguration);
    const masterLines = segmentByNewline(masterContent);

    const finalLines = masterLines.map((line) => {
        line = substituteParameters(line, masterParameters);
        const slotName = locateSlot(line);
        if (slotName) {
            const component = componentMap.get(slotName);
            return component !== undefined ? component : line;
        }
        return line;
    });

    return finalLines.join('\n');
}

/**
 * Extracts content sections (blocks) from a resource's content.
 * @param {string} content - The content to parse.
 * @param {object} runtimeConfiguration - Current configuration.
 * @returns {Map<string, string>} A map of section names to their content.
 */
function extractComponents(content, runtimeConfiguration) {
    const componentStorage = new Map();
    const lines = segmentByNewline(content);
    let currentSectionName = null;
    let sectionLines = [];

    for (const line of lines) {
        const beginMatch = line.match(directivePatterns.sectionBegin);
        const endMatch = directivePatterns.sectionEnd.test(line);

        if (beginMatch) {
            if (currentSectionName !== null) {
                componentStorage.set(currentSectionName, formatSectionContent(sectionLines.join('\n'), currentSectionName, runtimeConfiguration.commentMarkers));
            }
            currentSectionName = beginMatch[1];
            sectionLines = [];
        } else if (endMatch) {
            if (currentSectionName !== null) {
                componentStorage.set(currentSectionName, formatSectionContent(sectionLines.join('\n'), currentSectionName, runtimeConfiguration.commentMarkers));
                currentSectionName = null;
                sectionLines = [];
            }
        } else if (currentSectionName !== null) {
            sectionLines.push(line);
        }
    }
    if (currentSectionName !== null) {
        componentStorage.set(currentSectionName, formatSectionContent(sectionLines.join('\n'), currentSectionName, runtimeConfiguration.commentMarkers));
    }

    return componentStorage;
}

function formatSectionContent(content, name, addMarkers) {
    if (!addMarkers) return content;
    return [
        `<!-- start ${name} -->`,
        content,
        `<!-- end ${name} -->`
    ].join('\n');
}

/**
 * Parses a line for a master blueprint directive.
 * @param {string} line - The line to parse.
 * @returns {object|null} An object with 'target' and 'parameters' or null.
 */
function locateBlueprint(line) {
    const match = line.match(directivePatterns.mainBlueprint);
    return match ? {
        target: match[1],
        parameters: match[2] ? parseJsonSafely(match[2]) : null
    } : null;
}

/**
 * Parses a line for an embed fragment directive.
 * @param {string} line - The line to parse.
 * @returns {object|null} An object with 'target' and 'parameters' or null.
 */
function locateFragment(line) {
    const match = line.match(directivePatterns.embedFragment);
    return match ? {
        target: match[1],
        parameters: match[2] ? parseJsonSafely(match[2]) : null
    } : null;
}

/**
 * Parses a line for a content slot directive.
 * @param {string} line - The line to parse.
 * @returns {string|null} The slot name or null.
 */
function locateSlot(line) {
    const match = line.match(directivePatterns.contentSlot);
    return match ? match[1] : null;
}

/**
 * Replaces variable parameters in a template string.
 * @param {string} template - The template string.
 * @param {object} context - The context object for variables.
 * @returns {string} The template string with variables interpolated.
 */
function substituteParameters(template, context) {
    if (!context || typeof context !== 'object') { return template; }
    if (template.indexOf('@@param') < 0) { return template; }

    let processedTemplate = template;
    let match;
    // Regex is not global, so it finds the first match each time on the current string
    while ((match = directivePatterns.variableParam.exec(processedTemplate)) !== null) {
        const paramName = match[1];
        const replacement = context[paramName] !== undefined ? String(context[paramName]) : '';
        processedTemplate = processedTemplate.replace(match[0], replacement);
    }
    return processedTemplate;
}

/**
 * Splits a string into an array of lines.
 * @param {string} text - The input string.
 * @returns {string[]} An array of lines.
 */
function segmentByNewline(text) {
    return text.split(/\r\n|\n|\r/);
}

/**
 * Resolves an absolute path for a resource, considering a root option.
 * @param {string} currentResourcePath - The path of the resource currently being processed.
 * @param {string} relativeOrRootPath - The path found in the directive.
 * @param {string} [rootOption] - An optional root directory for root-relative paths.
 * @returns {string} The absolute path.
 */
function resolveResourcePath(currentResourcePath, relativeOrRootPath, rootOption) {
    if (rootOption && isRootRelativeReference(relativeOrRootPath)) {
        return route.join(process.cwd(), rootOption, relativeOrRootPath);
    } else {
        return route.join(route.dirname(currentResourcePath), relativeOrRootPath);
    }
}

/**
 * Checks if a path is relative to the defined root (starts with path separator).
 * @param {string} p - The path to check.
 * @returns {boolean} True if root-relative.
 */
function isRootRelativeReference(p) {
    return p.indexOf(route.normalize(route.sep)) === 0;
}

/**
 * Safely parses a JSON string.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {object|null} The parsed object or null if parsing fails.
 */
function parseJsonSafely(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        relayMessage('Warning: Failed to parse JSON context:', jsonString, e.message);
        return null;
    }
}