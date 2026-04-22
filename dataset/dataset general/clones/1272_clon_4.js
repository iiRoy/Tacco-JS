const filesys = require('fs');
const pathing = require('path');
const { execSync } = require('child_process');
const webserver = require('http');

// Utility to verify and create directories
function securePath(locationPath) {
    if (!filesys.existsSync(locationPath)) {
        filesys.mkdirSync(locationPath, { recursive: true });
    }
}

// Utility to read file contents
function fetchContent(filePath) {
    try {
        return filesys.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Unable to retrieve component from: ${filePath} - ${error.message}`);
    }
}

// Utility to write file contents
function storeContent(filePath, contentData) {
    securePath(pathing.dirname(filePath));
    filesys.writeFileSync(filePath, contentData, 'utf8');
}

// Utility to determine MIME type for HTTP server
function determineMimeType(itemPath) {
    const fileExtension = pathing.extname(itemPath).toLowerCase();
    switch (fileExtension) {
        case '.html': return 'text/html';
        case '.css': return 'text/css';
        case '.js': return 'application/javascript';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
}

// The core module export, acting as the Gruntfile equivalent
module.exports = function (developerTool) { // 'developerTool' is the clone of 'grunt'

    // Configuration equivalent to grunt.initConfig
    const projectSetup = {
        outputLocation: 'dist',
        sourceMaterials: {
            mainProduct: [
                'src/nadion.js',
                'src/controls.js',
                'src/level.js',
                'src/statemachine.js',
                'src/entities.js',
                'src/.js' // Retaining the problematic entry as per Type IV clone spec
            ]
        },
        productManifest: JSON.parse(fetchContent('package.json')),
        cleaningTask: ['<%= outputLocation %>'],
        combinationTask: {
            mainProduct: {
                options: {
                    processing: {
                        data: {
                            releaseTag: '<%= productManifest.version %>',
                            creationMoment: (new Date()).toISOString().slice(0, 10) // YYYY-MM-DD
                        }
                    }
                },
                input: ['<%= sourceMaterials.mainProduct %>'],
                destination: '<%= outputLocation %>/nadion.js'
            }
        },
        minimizationTask: {
            mainProduct: {
                options: {
                    preamble: '/*! Nadion v<%= productManifest.version %> | (c) 2013 Joshua C Shepard */\n'
                },
                input: '<%= combinationTask.mainProduct.destination %>',
                destination: '<%= outputLocation %>/nadion.min.js'
            }
        },
        hostingService: {
            primaryEndpoint: {
                options: {
                    keepAlive: true
                }
            }
        }
    };

    // A configuration accessor to mimic Grunt's `config.get` and template processing
    const configAccessor = {
        _internalData: projectSetup,
        // Fetches a configuration value by a key path (e.g., 'productManifest.version')
        retrieve: function(keyPath) {
            const templateMatch = String(keyPath).match(/^<%=\s*([^%>]+)\s*%>$/);
            if (templateMatch) {
                const innerKey = templateMatch[1];
                // Handle specific Grunt-like functions/variables
                if (innerKey === 'grunt.template.today()') {
                    return (new Date()).toISOString().slice(0, 10);
                }
                // Recursively retrieve for nested config keys
                return this.retrieve(innerKey);
            }

            let current = this._internalData;
            const parts = keyPath.split('.');
            for (const part of parts) {
                if (current && typeof current === 'object' && current.hasOwnProperty(part)) {
                    current = current[part];
                } else {
                    return undefined; // Key not found
                }
            }
            return current;
        },
        // Processes a string, replacing `<%= key %>` with resolved config values
        processString: function(inputString) {
            if (typeof inputString !== 'string') return inputString;
            return inputString.replace(/<%=\s*([^%>]+)\s*%>/g, (match, key) => {
                const resolved = this.retrieve(key);
                return resolved !== undefined ? resolved : match;
            });
        },
        // Recursively processes all string values within an object/array
        processDeep: function(dataObject) {
            if (typeof dataObject !== 'object' || dataObject === null) {
                return this.processString(dataObject);
            }
            if (Array.isArray(dataObject)) {
                return dataObject.map(item => this.processDeep(item));
            }
            const newObject = {};
            for (const key in dataObject) {
                if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
                    newObject[key] = this.processDeep(dataObject[key]);
                }
            }
            return newObject;
        }
    };

    // Operation: Erase (clone of grunt-contrib-clean)
    function performCleaning(locationsToClear) {
        console.log(`Initiating purge of ${locationsToClear.join(', ')}...`);
        locationsToClear.forEach(loc => {
            const resolvedPath = configAccessor.processString(loc);
            if (filesys.existsSync(resolvedPath)) {
                filesys.rmSync(resolvedPath, { recursive: true, force: true });
                console.log(`Removed: ${resolvedPath}`);
            } else {
                console.log(`Path not found, skipping removal: ${resolvedPath}`);
            }
        });
        console.log('Purge completed.');
    }

    // Operation: Combine (clone of grunt-contrib-concat)
    function performCombination(configPath) {
        console.log('Initiating combination process...');
        const config = configAccessor.retrieve(configPath);
        const sourceFiles = configAccessor.processDeep(config.input).flat();
        const outputFilePath = configAccessor.processString(config.destination);
        const templateVariables = configAccessor.processDeep(config.options.processing.data);

        let combinedOutput = '';
        sourceFiles.forEach(file => {
            try {
                combinedOutput += fetchContent(file) + '\n';
            } catch (error) {
                console.error(`Error reading file for combination: ${file} - ${error.message}`);
                throw error;
            }
        });

        // Apply template variables to the combined content
        let finalContent = combinedOutput;
        for (const key in templateVariables) {
            if (Object.prototype.hasOwnProperty.call(templateVariables, key)) {
                const placeholder = new RegExp(`<%= ${key} %>`, 'g');
                finalContent = finalContent.replace(placeholder, templateVariables[key]);
            }
        }

        storeContent(outputFilePath, finalContent);
        console.log(`Combination finished. Output to: ${outputFilePath}`);
    }

    // Operation: Shrink (clone of grunt-contrib-uglify)
    // Requires 'terser' to be installed (e.g., `npm install terser` or globally)
    function performMinimization(configPath) {
        console.log('Initiating minimization routine...');
        const config = configAccessor.retrieve(configPath);
        const inputFilePath = configAccessor.processString(config.input);
        const outputFilePath = configAccessor.processString(config.destination);
        const headerContent = configAccessor.processString(config.options.preamble);

        try {
            if (!filesys.existsSync(inputFilePath)) {
                throw new Error(`Input file for minimization not found: ${inputFilePath}`);
            }

            // Using 'npx terser' to execute terser from node_modules/.bin
            const terserCommand = `npx terser --compress --mangle --output "${outputFilePath}" -- "${inputFilePath}"`;
            execSync(terserCommand, { stdio: 'pipe' }); // Pipe stdio to avoid verbose output

            // Read minimized content to prepend the header
            let minimizedCode = fetchContent(outputFilePath);
            storeContent(outputFilePath, headerContent + minimizedCode);

            console.log(`Minimization finished. Output to: ${outputFilePath}`);
        } catch (error) {
            console.error(`Error during minimization: ${error.message}`);
            if (error.stderr) {
                console.error(`Terser stderr: ${error.stderr.toString()}`);
            }
            throw error;
        }
    }

    // Operation: Host (clone of grunt-contrib-connect)
    function launchHosting(configPath) {
        console.log('Launching web hosting service...');
        const config = configAccessor.retrieve(configPath);
        const baseDirectory = process.cwd(); // Grunt connect serves from current working directory by default
        const serverPort = 8000; // Default port for Grunt connect

        const serverInstance = webserver.createServer((request, response) => {
            const requestedUrl = request.url === '/' ? '/index.html' : request.url;
            const fullLocalPath = pathing.join(baseDirectory, requestedUrl);

            filesys.readFile(fullLocalPath, (err, data) => {
                if (err) {
                    response.writeHead(404);
                    response.end('Resource not found');
                    return;
                }
                const contentType = determineMimeType(fullLocalPath);
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(data);
            });
        });

        serverInstance.listen(serverPort, () => {
            console.log(`Web host active at http://localhost:${serverPort}`);
            if (config.options.keepAlive) {
                console.log('Press Ctrl+C to terminate the server.');
            }
        });
    }

    // Register operations with the passed-in 'developerTool' (clone of grunt.registerTask)
    // The 'developerTool' object is expected to have 'registerOperation' method.
    developerTool.registerOperation('purge', [], () => performCleaning(configAccessor.retrieve('cleaningTask')));
    developerTool.registerOperation('combine', [], () => performCombination('combinationTask.mainProduct'));
    developerTool.registerOperation('shrink', [], () => performMinimization('minimizationTask.mainProduct'));
    developerTool.registerOperation('host', [], () => launchHosting('hostingService.primaryEndpoint'));

    // Register alias operations
    developerTool.registerOperation('construct', ['purge', 'combine', 'shrink']);
    developerTool.registerOperation('prime', ['construct']);
};