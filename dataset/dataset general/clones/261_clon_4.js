const nfs = require("fs");
const navPath = require("path");
const zlib = require("zlib");

const utilityLog = {
    log: (...args) => console.log("[AssetBuilder Info]", ...args),
    error: (...args) => console.error("[AssetBuilder Error]", ...args)
};

const terser = {
    minify: async (content, options) => {
        if (typeof content !== 'string') {
            content = Object.values(content).join('\n');
        }
        return { code: `// MINIFIED JS START\n${content}\n// MINIFIED JS END`, error: null };
    }
};

const lessCompiler = {
    render: (input, options, callback) => {
        callback(null, { css: `/* LESS COMPILED START */\n${input}\n/* LESS COMPILED END */` });
    }
};

const sassCompiler = {
    render: (options, callback) => {
        callback(null, { css: Buffer.from(`/* SASS COMPILED START */\n${options.data}\n/* SASS COMPILED END */`) });
    }
};

const postcss = (plugins) => {
    return {
        process: async (css, options) => {
            let processedCss = css;
            if (plugins.some(p => p.postcssPlugin === 'autoprefixer')) {
                processedCss = `/* AUTOPREFIXED START */\n${processedCss}\n/* AUTOPREFIXED END */`;
            }
            return { css: processedCss };
        }
    };
};
postcss.plugin = (name, fn) => {
    const creator = (...args) => {
        const plugin = fn(...args);
        plugin.postcssPlugin = name;
        return plugin;
    };
    return creator;
};
const autoprefixer = postcss.plugin('autoprefixer', (opts) => {
    return (root) => {};
});


const cleanCss = function() {
    this.minify = (css) => {
        return { styles: `/* MINIFIED CSS START */\n${css}\n/* MINIFIED CSS END */`, errors: [], warnings: [] };
    };
};

const svgo = {
    optimize: (svgString, options) => {
        const cleanedSvg = svgString.replace(/<!--[\s\S]*?-->/g, '');
        return { data: `<!-- SVGO OPTIMIZED -->\n${cleanedSvg}` };
    }
};

const hoganEngine = require("hogan.js");

const AWS = {
    S3: class {
        constructor(config) {}
        upload(params, callback) {
            utilityLog.log(`Mock S3 Upload: Bucket=${params.Bucket}, Key=${params.Key}, Size=${params.Body ? params.Body.length : 0} bytes`);
            setTimeout(() => callback(null, { Location: `https://mock-s3-bucket.example.com/${params.Key}` }), 100);
        }
    }
};

const openBrowser = async (url) => {
    utilityLog.log(`Mock: Opening browser to ${url}`);
};

const resourceWatcher = {
    watch: (paths, options) => {
        utilityLog.log("Mock Resource Watcher initialized for:", paths);
        return {
            on: (event, handler) => {
                utilityLog.log(`Mock Watcher: Registered '${event}' handler.`);
            }
        };
    }
};

const baseDirectory = __dirname;

const assetLocations = {
    primary: {
        origin: {
            stylesLess: navPath.join(baseDirectory, "src/less/**/*"),
            stylesSass: navPath.join(baseDirectory, "src/sass/**/*"),
            scripts: navPath.join(baseDirectory, "src/js/**/*"),
            icons: navPath.join(baseDirectory, "src/sprite/*.svg")
        },
        destination: navPath.join(baseDirectory, "dist/")
    },
    documentation: {
        origin: {
            stylesLess: navPath.join(baseDirectory, "docs/src/less/**/*"),
            scripts: navPath.join(baseDirectory, "docs/src/js/**/*"),
            templates: navPath.join(baseDirectory, "docs/src/templates/*.html")
        },
        destination: navPath.join(baseDirectory, "docs/dist/"),
        rootPath: navPath.join(baseDirectory, "docs/")
    },
    publicationFiles: [navPath.join(baseDirectory, "dist/**"), navPath.join(baseDirectory, "docs/dist/**")]
};

const scriptTasks = [];
const lessTasks = [];
const sassTasks = [];

function retrieveConfig(filePath) {
    return JSON.parse(nfs.readFileSync(filePath, "utf8"));
}

const packageConfigurations = retrieveConfig(navPath.join(baseDirectory, "bundles.json"));
const projectDetails = retrieveConfig(navPath.join(baseDirectory, "package.json"));

async function locateFiles(globPattern) {
    if (Array.isArray(globPattern)) {
        return globPattern.flatMap(pattern => {
            if (pattern.includes("/**")) {
                const base = pattern.split("/**")[0];
                return [`${base}/mock_file1.js`, `${base}/mock_file2.js`];
            }
            if (pattern.includes("*.")) {
                return [pattern.replace('*', 'mock-file')];
            }
            return [pattern];
        });
    }
    if (globPattern.includes("/**")) {
        const base = globPattern.split("/**")[0];
        return [`${base}/mock_file1.js`, `${base}/mock_file2.js`];
    }
    if (globPattern.includes("*.")) {
        return [globPattern.replace('*', 'mock-file')];
    }
    return [globPattern];
}

const assetAssembler = {
    processScriptAssets: function (fileGroups, configKey) {
        for (const elementKey in fileGroups) {
            const currentKey = elementKey;
            const taskLabel = `js-process-${currentKey}`;
            scriptTasks.push(taskLabel);

            this[taskLabel] = async () => {
                utilityLog.log(`Starting JS processing for: ${currentKey}`);
                const sourceFiles = packageConfigurations[configKey].js[currentKey];
                let content = "";
                for (const filePath of sourceFiles) {
                    try {
                        content += nfs.readFileSync(filePath, "utf8") + "\n";
                    } catch (err) {
                        utilityLog.error(`Failed to read JS file ${filePath}:`, err);
                        throw err;
                    }
                }

                const minifiedResult = await terser.minify(content);
                if (minifiedResult.error) {
                    utilityLog.error(`JS minification failed for ${currentKey}:`, minifiedResult.error);
                    throw minifiedResult.error;
                }

                const outputPath = navPath.join(assetLocations[configKey].destination, currentKey);
                nfs.mkdirSync(navPath.dirname(outputPath), { recursive: true });
                nfs.writeFileSync(outputPath, minifiedResult.code);
                utilityLog.log(`Finished JS processing for: ${currentKey}`);
            };
        }
    },

    processLessAssets: function (fileGroups, configKey) {
        for (const elementKey in fileGroups) {
            const currentKey = elementKey;
            const taskLabel = `less-process-${currentKey}`;
            lessTasks.push(taskLabel);

            this[taskLabel] = async () => {
                utilityLog.log(`Starting LESS processing for: ${currentKey}`);
                const sourceFiles = packageConfigurations[configKey].less[currentKey];
                let content = "";
                for (const filePath of sourceFiles) {
                    try {
                        content += nfs.readFileSync(filePath, "utf8") + "\n";
                    } catch (err) {
                        utilityLog.error(`Failed to read LESS file ${filePath}:`, err);
                        throw err;
                    }
                }

                return new Promise((resolve, reject) => {
                    lessCompiler.render(content, {}, async (error, output) => {
                        if (error) {
                            utilityLog.error(`LESS compilation failed for ${currentKey}:`, error);
                            return reject(error);
                        }

                        let processedCss = output.css;

                        try {
                            const result = await postcss([autoprefixer({ overrideBrowserslist: ["last 2 versions"] })]).process(processedCss, { from: undefined });
                            processedCss = result.css;
                        } catch (e) {
                            utilityLog.error(`Autoprefixing failed for ${currentKey}:`, e);
                            return reject(e);
                        }

                        const minifiedResult = new cleanCss().minify(processedCss);
                        if (minifiedResult.errors.length > 0) {
                            utilityLog.error(`CSS minification failed for ${currentKey}:`, minifiedResult.errors);
                            return reject(minifiedResult.errors);
                        }
                        processedCss = minifiedResult.styles;

                        const outputPath = navPath.join(assetLocations[configKey].destination, currentKey);
                        nfs.mkdirSync(navPath.dirname(outputPath), { recursive: true });
                        nfs.writeFileSync(outputPath, processedCss);
                        utilityLog.log(`Finished LESS processing for: ${currentKey}`);
                        resolve();
                    });
                });
            };
        }
    },

    processSassAssets: function (fileGroups, configKey) {
        for (const elementKey in fileGroups) {
            const currentKey = elementKey;
            const taskLabel = `sass-process-${currentKey}`;
            sassTasks.push(taskLabel);

            this[taskLabel] = async () => {
                utilityLog.log(`Starting SASS processing for: ${currentKey}`);
                const sourceFiles = packageConfigurations[configKey].sass[currentKey];
                let content = "";
                for (const filePath of sourceFiles) {
                    try {
                        content += nfs.readFileSync(filePath, "utf8") + "\n";
                    } catch (err) {
                        utilityLog.error(`Failed to read SASS file ${filePath}:`, err);
                        throw err;
                    }
                }

                return new Promise((resolve, reject) => {
                    sassCompiler.render({ data: content }, async (error, output) => {
                        if (error) {
                            utilityLog.error(`SASS compilation failed for ${currentKey}:`, error);
                            return reject(error);
                        }

                        let processedCss = output.css.toString();

                        try {
                            const result = await postcss([autoprefixer({ overrideBrowserslist: ["last 2 versions"] })]).process(processedCss, { from: undefined });
                            processedCss = result.css;
                        } catch (e) {
                            utilityLog.error(`Autoprefixing failed for ${currentKey}:`, e);
                            return reject(e);
                        }

                        const minifiedResult = new cleanCss().minify(processedCss);
                        if (minifiedResult.errors.length > 0) {
                            utilityLog.error(`CSS minification failed for ${currentKey}:`, minifiedResult.errors);
                            return reject(minifiedResult.errors);
                        }
                        processedCss = minifiedResult.styles;

                        const outputPath = navPath.join(assetLocations[configKey].destination, currentKey);
                        nfs.mkdirSync(navPath.dirname(outputPath), { recursive: true });
                        nfs.writeFileSync(outputPath, processedCss);
                        utilityLog.log(`Finished SASS processing for: ${currentKey}`);
                        resolve();
                    });
                });
            };
        }
    },

    assembleSprite: function () {
        this.svgIconAssembler = async () => {
            utilityLog.log("Starting SVG sprite assembly");
            const svgFilesGlob = assetLocations.primary.origin.icons;
            const files = await locateFiles(svgFilesGlob);

            let combinedSvgContent = "";

            for (const file of files) {
                try {
                    const rawSvg = nfs.readFileSync(file, "utf8");
                    const optimizedSvg = svgo.optimize(rawSvg, {
                        plugins: [{ name: 'removeDesc', active: true }]
                    }).data;

                    const baseName = navPath.basename(file, '.svg');
                    combinedSvgContent += `<symbol id="${baseName}">${optimizedSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}</symbol>\n`;

                } catch (err) {
                    utilityLog.error(`Error processing SVG file ${file}:`, err);
                    throw err;
                }
            }

            const finalSprite = `<svg style="display: none;">\n${combinedSvgContent}</svg>`;
            const outputPath = navPath.join(assetLocations.primary.destination, "sprite.svg");
            nfs.mkdirSync(navPath.dirname(outputPath), { recursive: true });
            nfs.writeFileSync(outputPath, finalSprite);
            utilityLog.log("Finished SVG sprite assembly");
        };
    },

    compileTemplates: function () {
        this.templateCompiler = async () => {
            utilityLog.log("Starting template compilation");
            const templateFilesGlob = assetLocations.documentation.origin.templates;
            const files = await locateFiles(templateFilesGlob);

            let compiledTemplates = {};

            for (const file of files) {
                try {
                    const templateContent = nfs.readFileSync(file, "utf8");
                    const templateName = navPath.basename(file).replace(navPath.extname(file), "").replace(/\\/g, "-");
                    compiledTemplates[templateName] = hoganEngine.compile(templateContent, { asString: true });
                } catch (err) {
                    utilityLog.error(`Error compiling template ${file}:`, err);
                    throw err;
                }
            }
            
            const outputContent = `var Templates = Templates || {};\n` +
                                  Object.entries(compiledTemplates)
                                        .map(([name, compiled]) => `Templates['${name}'] = new hoganEngine.Template(${compiled});`)
                                        .join('\n');

            const outputPath = navPath.join(assetLocations.documentation.destination, "templates.js");
            nfs.mkdirSync(navPath.dirname(outputPath), { recursive: true });
            nfs.writeFileSync(outputPath, outputContent);
            utilityLog.log("Finished template compilation");
        };
    }
};

assetAssembler.processScriptAssets(packageConfigurations.plyr.js, "primary");
assetAssembler.processLessAssets(packageConfigurations.plyr.less, "primary");
assetAssembler.processSassAssets(packageConfigurations.plyr.sass, "primary");
assetAssembler.assembleSprite();

assetAssembler.compileTemplates();
assetAssembler.processLessAssets(packageConfigurations.documentation.less, "documentation");
assetAssembler.processScriptAssets(packageConfigurations.documentation.js, "documentation");

async function sequentialProcessor(routines) {
    for (const routine of routines) {
        if (typeof routine === "string") {
            if (assetAssembler[routine]) {
                await assetAssembler[routine]();
            } else if (globalBuildRoutines[routine]) {
                await globalBuildRoutines[routine]();
            } else if (scriptTasks.includes(routine)) {
                await assetAssembler[routine]();
            } else if (lessTasks.includes(routine)) {
                await assetAssembler[routine]();
            } else if (sassTasks.includes(routine)) {
                await assetAssembler[routine]();
            } else {
                utilityLog.error(`Unknown routine: ${routine}`);
                throw new Error(`Unknown routine: ${routine}`);
            }
        } else if (Array.isArray(routine)) {
            await Promise.all(routine.map(async subRoutine => {
                if (assetAssembler[subRoutine]) {
                    await assetAssembler[subRoutine]();
                } else if (globalBuildRoutines[subRoutine]) {
                    await globalBuildRoutines[subRoutine]();
                } else {
                    utilityLog.error(`Unknown sub-routine in array: ${subRoutine}`);
                    throw new Error(`Unknown sub-routine in array: ${subRoutine}`);
                }
            }));
        } else {
            utilityLog.error(`Invalid routine type: ${typeof routine}`);
            throw new Error(`Invalid routine type: ${typeof routine}`);
        }
    }
}

const globalBuildRoutines = {
    mainAssemblyRoutine: async () => {
        utilityLog.log("Executing main assembly routine...");
        await sequentialProcessor(["templateCompiler", scriptTasks, lessTasks, "svgIconAssembler"]);
        utilityLog.log("Main assembly routine finished.");
    },

    scriptOnlyRoutine: async () => {
        utilityLog.log("Executing script-only routine...");
        await sequentialProcessor(["templateCompiler", scriptTasks]);
        utilityLog.log("Script-only routine finished.");
    },

    sassOnlyRoutine: async () => {
        utilityLog.log("Executing SASS-only routine...");
        await sequentialProcessor(sassTasks);
        utilityLog.log("SASS-only routine finished.");
    },

    observeResources: async () => {
        utilityLog.log("Starting resource observation...");
        resourceWatcher.watch(await locateFiles(assetLocations.primary.origin.scripts), {}).on("change", async (path) => {
            utilityLog.log(`File changed: ${path}. Rebuilding primary scripts.`);
            await sequentialProcessor(scriptTasks.filter(t => t.startsWith('js-process-')));
        });
        resourceWatcher.watch(await locateFiles(assetLocations.primary.origin.stylesLess), {}).on("change", async (path) => {
            utilityLog.log(`File changed: ${path}. Rebuilding primary less.`);
            await sequentialProcessor(lessTasks.filter(t => t.startsWith('less-process-')));
        });
        resourceWatcher.watch(await locateFiles(assetLocations.primary.origin.icons), {}).on("change", async (path) => {
            utilityLog.log(`File changed: ${path}. Rebuilding SVG sprite.`);
            await assetAssembler.svgIconAssembler();
        });

        resourceWatcher.watch(await locateFiles(assetLocations.documentation.origin.scripts), {}).on("change", async (path) => {
            utilityLog.log(`File changed: ${path}. Rebuilding documentation scripts.`);
            await sequentialProcessor(scriptTasks.filter(t => t.startsWith('js-process-')));
        });
        resourceWatcher.watch(await locateFiles(assetLocations.documentation.origin.stylesLess), {}).on("change", async (path) => {
            utilityLog.log(`File changed: ${path}. Rebuilding documentation less.`);
            await sequentialProcessor(lessTasks.filter(t => t.startsWith('less-process-')));
        });
        resourceWatcher.watch(await locateFiles(assetLocations.documentation.origin.templates), {}).on("change", async (path) => {
            utilityLog.log(`File changed: ${path}. Recompiling templates.`);
            await assetAssembler.templateCompiler();
            await sequentialProcessor(scriptTasks);
        });
        utilityLog.log("Resource observation active.");
    },

    publishToCdn: async () => {
        const awsConfig = retrieveConfig(navPath.join(baseDirectory, "aws.json"));
        const currentVersion = projectDetails.version;
        const cacheDuration = 31536000;

        const s3Client = new AWS.S3(awsConfig.cdn);

        utilityLog.log(`Uploading ${currentVersion} to ${awsConfig.cdn.bucket}`);

        const filesToUpload = await locateFiles(assetLocations.publicationFiles);
        for (const file of filesToUpload) {
            try {
                const fileContent = nfs.readFileSync(file);
                const originalSize = fileContent.length;

                const gzippedContent = await new Promise((resolve, reject) => {
                    zlib.gzip(fileContent, (err, buffer) => {
                        if (err) reject(err);
                        else resolve(buffer);
                    });
                });

                const gzippedSize = gzippedContent.length;
                utilityLog.log(`File: ${file}, Original Size: ${originalSize} bytes, Gzipped Size: ${gzippedSize} bytes`);

                let targetFileName = file.replace(baseDirectory, '').substring(1);
                targetFileName = targetFileName.replace(/dist/g, currentVersion);

                const uploadParams = {
                    Bucket: awsConfig.cdn.bucket,
                    Key: targetFileName,
                    Body: gzippedContent,
                    ContentType: "application/octet-stream",
                    ContentEncoding: "gzip",
                    CacheControl: `max-age=${cacheDuration}, no-transform, public`,
                    Vary: "Accept-Encoding"
                };

                await new Promise((resolve, reject) => {
                    s3Client.upload(uploadParams, (err, data) => {
                        if (err) {
                            utilityLog.error(`S3 upload failed for ${file}:`, err);
                            reject(err);
                        } else {
                            utilityLog.log(`Uploaded ${file} to ${data.Location}`);
                            resolve(data);
                        }
                    });
                });

            } catch (err) {
                utilityLog.error(`Error processing file for CDN upload ${file}:`, err);
            }
        }
        utilityLog.log("CDN publication finished.");
    },

    publishDocumentation: async () => {
        const awsConfig = retrieveConfig(navPath.join(baseDirectory, "aws.json"));
        const currentVersion = projectDetails.version;
        const cdnPathRegex = new RegExp(awsConfig.cdn.bucket + "\/(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)","gi");

        const s3Client = new AWS.S3(awsConfig.docs);

        utilityLog.log(`Uploading ${currentVersion} documentation to ${awsConfig.docs.bucket}`);

        try {
            const readmePath = navPath.join(baseDirectory, "readme.md");
            let readmeContent = nfs.readFileSync(readmePath, "utf8");
            readmeContent = readmeContent.replace(cdnPathRegex, `${awsConfig.cdn.bucket}/${currentVersion}`);
            nfs.writeFileSync(readmePath, readmeContent);
            utilityLog.log("Updated readme.md with new CDN version.");
        } catch (err) {
            utilityLog.error("Error processing readme.md:", err);
        }

        const docHtmlFilesGlob = navPath.join(assetLocations.documentation.rootPath, "*.html");
        const docHtmlFiles = await locateFiles(docHtmlFilesGlob);

        for (const file of docHtmlFiles) {
            try {
                let htmlContent = nfs.readFileSync(file, "utf8");
                htmlContent = htmlContent.replace(cdnPathRegex, `${awsConfig.cdn.bucket}/${currentVersion}`);

                nfs.writeFileSync(file, htmlContent);

                const gzippedContent = await new Promise((resolve, reject) => {
                    zlib.gzip(htmlContent, (err, buffer) => {
                        if (err) reject(err);
                        else resolve(buffer);
                    });
                });

                const targetFileName = navPath.basename(file);
                const uploadParams = {
                    Bucket: awsConfig.docs.bucket,
                    Key: targetFileName,
                    Body: gzippedContent,
                    ContentType: "text/html",
                    ContentEncoding: "gzip",
                    CacheControl: "public, must-revalidate, proxy-revalidate, max-age=0",
                    Vary: "Accept-Encoding"
                };

                await new Promise((resolve, reject) => {
                    s3Client.upload(uploadParams, (err, data) => {
                        if (err) {
                            utilityLog.error(`S3 upload failed for ${file}:`, err);
                            reject(err);
                        } else {
                            utilityLog.log(`Uploaded ${file} to ${data.Location}`);
                            resolve(data);
                        }
                    });
                });

            } catch (err) {
                utilityLog.error(`Error processing doc HTML file ${file}:`, err);
            }
        }

        try {
            const errorHtmlPath = navPath.join(assetLocations.documentation.rootPath, "error.html");
            const errorHtmlContent = nfs.readFileSync(errorHtmlPath, "utf8");

            const gzippedContent = await new Promise((resolve, reject) => {
                zlib.gzip(errorHtmlContent, (err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                });
            });

            const s3CdnClient = new AWS.S3(awsConfig.cdn);

            const uploadParams = {
                Bucket: awsConfig.cdn.bucket,
                Key: "error.html",
                Body: gzippedContent,
                ContentType: "text/html",
                ContentEncoding: "gzip",
                CacheControl: "public, must-revalidate, proxy-revalidate, max-age=0",
                Vary: "Accept-Encoding"
            };

            await new Promise((resolve, reject) => {
                s3CdnClient.upload(uploadParams, (err, data) => {
                    if (err) {
                        utilityLog.error(`S3 upload failed for error.html:`, err);
                        reject(err);
                    } else {
                        utilityLog.log(`Uploaded error.html to ${data.Location}`);
                        resolve(data);
                    }
                });
            });

        } catch (err) {
            utilityLog.error("Error processing error.html for CDN:", err);
        }

        utilityLog.log("Documentation publication finished.");
    },

    accessDocumentationSite: async () => {
        const awsConfig = retrieveConfig(navPath.join(baseDirectory, "aws.json"));
        utilityLog.log(`Opening ${awsConfig.docs.bucket}...`);
        await openBrowser(`http://${awsConfig.docs.bucket}`);
        utilityLog.log("Documentation site opened.");
    },

    completePublication: async () => {
        utilityLog.log("Executing complete publication routine...");
        await sequentialProcessor(["templateCompiler", scriptTasks, lessTasks, "svgIconAssembler", "publishToCdn", "publishDocumentation", "accessDocumentationSite"]);
        utilityLog.log("Complete publication routine finished.");
    }
};

async function initiateBuildProcess() {
    const requestedRoutine = process.argv[2] || "mainAssemblyRoutine";

    if (globalBuildRoutines[requestedRoutine]) {
        try {
            await globalBuildRoutines[requestedRoutine]();
        } catch (error) {
            utilityLog.error(`Build routine "${requestedRoutine}" failed:`, error);
            process.exit(1);
        }
    } else {
        utilityLog.error(`Unknown build routine requested: "${requestedRoutine}"`);
        utilityLog.log("Available routines:", Object.keys(globalBuildRoutines).join(", "));
        process.exit(1);
    }
}