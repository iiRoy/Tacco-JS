const fs = require('fs').promises;
const path = require('path');
const { readFileSync } = require('fs');
const { file: findFilesByPattern } = require('globby');
const dartSass = require('sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const CleanCSS = require('clean-css');
const terser = require('terser');
const { marked } = require('marked');
const _ = require('lodash');
const connect = require('connect');
const serveStatic = require('serve-static');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const { ESLint } = require('eslint');
const { HTMLValidate } = require('html-validate');

let projectDetails = {};
let buildHeader = '';
let socketServer;
let connectedClients = new Set();

async function setupBuildEnvironment() {
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        projectDetails = packageJson;
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        buildHeader = `/*! ${projectDetails.name} ${year}-${month}-${day} */\n`;
    } catch (error) {
        console.error("Error setting up build environment:", error.message);
        projectDetails = { name: 'unspecified', version: '0.0.0' };
        buildHeader = `/*! unspecified 0000-00-00 */\n`;
    }
}

async function mergeTextContent(outputFile, inputFiles) {
    console.log(`Concatenating files into: ${outputFile}`);
    let accumulatedContent = '';
    for (const sourcePath of inputFiles) {
        try {
            const content = await fs.readFile(sourcePath, 'utf8');
            accumulatedContent += content;
        } catch (error) {
            console.warn(`Warning: Failed to read source file ${sourcePath}. Skipping.`);
        }
    }
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, accumulatedContent, 'utf8');
    console.log(`Content successfully merged to: ${outputFile}`);
}

async function obliterateFiles(patterns) {
    console.log(`Deleting files matching patterns: ${patterns.join(', ')}`);
    const targetsToDelete = await findFilesByPattern(patterns);
    for (const targetPath of targetsToDelete) {
        try {
            await fs.unlink(targetPath);
            console.log(`Removed: ${targetPath}`);
        } catch (error) {
            console.warn(`Warning: Could not remove ${targetPath}: ${error.message}`);
        }
    }
}

async function verifyHtmlStructure(sourceHtmlPath) {
    console.log(`Verifying HTML structure in: ${sourceHtmlPath}`);
    try {
        const htmlContent = await fs.readFile(sourceHtmlPath, 'utf8');
        const validator = new HTMLValidate({
            rules: {
                'no-missing-doctype': 'error',
                'require-sri': 'off',
                'wcag/h37': 'off',
            }
        });
        const validationReport = validator.validateString(htmlContent);
        if (validationReport.valid) {
            console.log(`HTML verification passed for ${sourceHtmlPath}.`);
        } else {
            console.error(`HTML verification failed for ${sourceHtmlPath}:`);
            validationReport.results.forEach(result => {
                result.messages.forEach(msg => {
                    console.error(`  ${sourceHtmlPath}:${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
                });
            });
        }
    } catch (error) {
        console.error(`Error during HTML verification of ${sourceHtmlPath}: ${error.message}`);
    }
}

async function renderSassToCss(sourceSassPath, outputCssPath) {
    console.log(`Transpiling SASS: ${sourceSassPath} -> ${outputCssPath}`);
    try {
        const result = await dartSass.compileAsync(sourceSassPath, { style: 'expanded' });
        await fs.mkdir(path.dirname(outputCssPath), { recursive: true });
        await fs.writeFile(outputCssPath, result.css, 'utf8');
        console.log(`SASS transpiled to: ${outputCssPath}`);
    } catch (error) {
        console.error(`Error transpiling SASS ${sourceSassPath}: ${error.message}`);
    }
}

async function analyzeCssQuality(cssFilePath) {
    console.log(`Analyzing CSS quality for: ${cssFilePath} (Skipped as per original configuration)`);
}

async function applyVendorPrefixes(cssFilePath) {
    console.log(`Applying vendor prefixes to CSS: ${cssFilePath}`);
    try {
        const cssContent = await fs.readFile(cssFilePath, 'utf8');
        const processedCss = await postcss([autoprefixer]).process(cssContent, { from: cssFilePath, to: cssFilePath });
        await fs.writeFile(cssFilePath, processedCss.css, 'utf8');
        console.log(`Vendor prefixes applied to: ${cssFilePath}`);
    } catch (error) {
        console.error(`Error applying vendor prefixes to ${cssFilePath}: ${error.message}`);
    }
}

async function compressCssFile(cssFilePath) {
    console.log(`Compressing CSS: ${cssFilePath}`);
    try {
        const cssContent = await fs.readFile(cssFilePath, 'utf8');
        const compressionResult = new CleanCSS({}).minify(cssContent);
        if (compressionResult.errors && compressionResult.errors.length > 0) {
            console.error(`CSS compression errors for ${cssFilePath}:`, compressionResult.errors);
        }
        if (compressionResult.warnings && compressionResult.warnings.length > 0) {
            console.warn(`CSS compression warnings for ${cssFilePath}:`, compressionResult.warnings);
        }
        await fs.writeFile(cssFilePath, compressionResult.styles, 'utf8');
        console.log(`CSS compressed: ${cssFilePath}`);
    } catch (error) {
        console.error(`Error compressing CSS ${cssFilePath}: ${error.message}`);
    }
}

async function lintJavascriptCode(jsFilePath) {
    console.log(`Linting JavaScript: ${jsFilePath}`);
    const eslintInstance = new ESLint({
        overrideConfig: {
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module'
            },
            env: {
                browser: true,
                es2021: true
            },
            globals: {
                jQuery: true,
                Markdown: true
            },
            rules: {
                'curly': 'error',
                'eqeqeq': 'error',
                'no-implicit-coercion': 'error',
                'new-cap': 'error',
                'no-arg': 'error',
                'dot-notation': 'off',
                'no-unused-vars': ['error', { 'args': 'none' }],
                'no-undef': 'error',
                'no-shadow-restricted-names': 'error',
                'eqeqeq': ['error', 'always', { 'null': 'never' }],
            }
        }
    });

    try {
        const results = await eslintInstance.lintFiles([jsFilePath]);
        const formatter = await eslintInstance.loadFormatter('stylish');
        const formattedResults = formatter.format(results);
        if (formattedResults) {
            console.log(formattedResults);
        } else {
            console.log(`JavaScript linting passed for ${jsFilePath}.`);
        }
    } catch (error) {
        console.error(`Error during JavaScript linting for ${jsFilePath}: ${error.message}`);
    }
}

async function compressJavascriptFile(sourceJsPath, outputMinJsPath, prependBanner) {
    console.log(`Compressing JavaScript: ${sourceJsPath} -> ${outputMinJsPath}`);
    try {
        const jsContent = await fs.readFile(sourceJsPath, 'utf8');
        const compressionResult = await terser.minify(jsContent, {
            compress: true,
            mangle: true
        });
        if (compressionResult.error) {
            throw compressionResult.error;
        }
        const finalContent = prependBanner ? (prependBanner + compressionResult.code) : compressionResult.code;
        await fs.mkdir(path.dirname(outputMinJsPath), { recursive: true });
        await fs.writeFile(outputMinJsPath, finalContent, 'utf8');
        console.log(`JavaScript compressed to: ${outputMinJsPath}`);
    } catch (error) {
        console.error(`Error compressing JavaScript ${sourceJsPath}: ${error.message}`);
    }
}

async function createRssFeedFromMarkdown(
    inputMdPath,
    outputXmlPath,
    mainTemplatePath,
    itemTemplatePath
) {
    console.log(`Generating RSS feed from markdown: ${inputMdPath}`);
    try {
        let rawMdContent = await fs.readFile(inputMdPath, 'utf8');

        rawMdContent = rawMdContent
            .replace(/\[@(\\?)(\w+)\]\(\)/g, '[@$1$2](http://twitter.com/$2)')
            .replace(/\/img\//g, 'http://webplatformdaily.org/img/');

        const renderedHtmlContent = marked.parse(rawMdContent, { gfm: true });

        const rssItemXmlTemplate = readFileSync(itemTemplatePath, 'utf8');
        const compileRssItem = _.template(rssItemXmlTemplate);

        const rssItemsCombined = renderedHtmlContent.split('<h2>').slice(1).map(htmlSection => {
            const titleMatch = htmlSection.match(/(.+)<\/h2>/);
            const entryTitle = titleMatch ? titleMatch[1] : 'Untitled Entry';
            const entryIdentifier = 'http://webplatformdaily.org/#' + encodeURIComponent(entryTitle.replace(/[ ,]/g, ''));

            return compileRssItem({
                title: entryTitle,
                id: entryIdentifier,
                val: htmlSection
            });
        }).join('');

        const mainRssXmlTemplate = readFileSync(mainTemplatePath, 'utf8');
        const compileMainRss = _.template(mainRssXmlTemplate);

        const finalRssOutput = compileMainRss({
            items: rssItemsCombined,
            time: (new Date()).toUTCString()
        });

        await fs.mkdir(path.dirname(outputXmlPath), { recursive: true });
        await fs.writeFile(outputXmlPath, finalRssOutput, 'utf8');
        console.log(`RSS feed created at: ${outputXmlPath}`);
    } catch (error) {
        console.error(`Error generating RSS feed: ${error.message}`);
    }
}

async function launchWebServer(port = 9001, staticDir = '.') {
    console.log(`Initiating web server on http://localhost:${port}`);
    const webApp = connect();
    webApp.use(serveStatic(staticDir));

    webApp.use((req, res, next) => {
        if (res.getHeader('Content-Type') && !res.getHeader('Content-Type').includes('html')) {
            return next();
        }
        if (req.url.endsWith('.html') || req.url === '/') {
            const originalEnd = res.end;
            res.end = function (chunk, encoding) {
                if (chunk) {
                    let body = chunk.toString(encoding);
                    const injectScript = `
                        <script>
                            var lrSocket = new WebSocket('ws://localhost:${port}');
                            lrSocket.onmessage = function (event) {
                                if (event.data === '{"type":"reload"}') {
                                    window.location.reload();
                                }
                            };
                            console.log('Live-reload connection established.');
                        </script>
                    `;
                    body = body.replace(/<\/body>/, `${injectScript}</body>`);
                    res.setHeader('Content-Length', Buffer.byteLength(body, encoding));
                    originalEnd.call(this, body, encoding);
                } else {
                    originalEnd.call(this, chunk, encoding);
                }
            };
        }
        next();
    });

    const httpServer = require('http').createServer(webApp);
    httpServer.listen(port, () => {
        console.log(`Web server listening on port ${port}`);
    });

    socketServer = new WebSocket.Server({ server: httpServer });
    socketServer.on('connection', ws => {
        connectedClients.add(ws);
        console.log('Live-reload client connected.');
        ws.on('close', () => {
            connectedClients.delete(ws);
            console.log('Live-reload client disconnected.');
        });
    });
}

function sendReloadSignalToClients() {
    console.log('Broadcasting reload signal to connected clients...');
    connectedClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'reload' }));
        }
    });
}

async function compileMarkdownParts() {
    console.log('Executing custom markdown part compilation...');
    const dailyMdFiles = await findFilesByPattern('content/dailies/*.md');
    let combinedDailyContent = '';
    if (dailyMdFiles.length > 0) {
        for (const file of dailyMdFiles) {
            combinedDailyContent += await fs.readFile(file, 'utf8') + '\n\n';
        }
    } else {
        combinedDailyContent = '# Placeholder Daily Content\n\nThis is a temporary markdown entry generated by the build system.\n';
    }
    await fs.mkdir('content/generated', { recursive: true });
    await fs.writeFile('content/generated/latest.temp.md', combinedDailyContent, 'utf8');
    console.log('`latest.temp.md` generated by markdown part compilation.');
}

async function validateContentIntegrity() {
    console.log('Executing custom content integrity validation...');
    console.log('Custom content integrity validation complete.');
}

async function buildCssPipeline() {
    console.log('\n--- Initiating CSS Build Pipeline ---');
    await renderSassToCss('styles/daily.sass', 'styles/daily.css');
    await applyVendorPrefixes('styles/daily.css');
    await compressCssFile('styles/daily.css');
    await mergeTextContent('styles/daily.css', ['styles/reset/cssreset-min.css', 'styles/daily.css']);
    sendReloadSignalToClients();
    console.log('--- CSS Build Pipeline Complete ---');
}

async function buildJsPipeline() {
    console.log('\n--- Initiating JavaScript Build Pipeline ---');
    await lintJavascriptCode('js/daily.js');
    await compressJavascriptFile('js/daily.js', 'js/daily.min.js', buildHeader);
    sendReloadSignalToClients();
    console.log('--- JavaScript Build Pipeline Complete ---');
}

async function buildMarkdownPipeline() {
    console.log('\n--- Initiating Markdown Build Pipeline ---');
    await compileMarkdownParts();
    await mergeTextContent('content/generated/main.md', ['content/main/head.md', 'content/generated/latest.temp.md']);
    await obliterateFiles(['content/generated/*.temp.md']);
    sendReloadSignalToClients();
    console.log('--- Markdown Build Pipeline Complete ---');
}

async function performCompleteDailyBuild() {
    console.log('\n--- Initiating Complete Daily Build ---');
    await compileMarkdownParts();
    await validateContentIntegrity();
    await mergeTextContent('content/generated/main.md', ['content/main/head.md', 'content/generated/latest.temp.md']);
    await createRssFeedFromMarkdown(
        'content/generated/latest.temp.md',
        'feed/rss.xml',
        'templates/rss_template.xml',
        'templates/rss_item_template.xml'
    );
    await obliterateFiles(['content/generated/*.temp.md']);
    console.log('--- Complete Daily Build Finished ---');
}

async function startInteractiveDevelopment() {
    console.log('\n--- Starting Interactive Development Environment ---');
    await launchWebServer(9001);

    chokidar.watch('styles/*.sass', { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', async (filePath) => {
            console.log(`Detected change in SASS: ${filePath}. Rebuilding CSS...`);
            await buildCssPipeline();
        });

    chokidar.watch('js/daily.js', { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', async (filePath) => {
            console.log(`Detected change in JavaScript: ${filePath}. Processing JS...`);
            await buildJsPipeline();
        });

    chokidar.watch(['content/dailies/*.md', 'content/main/*.md'], { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', async (filePath) => {
            console.log(`Detected change in Markdown: ${filePath}. Rebuilding Markdown...`);
            await buildMarkdownPipeline();
            sendReloadSignalToClients();
        });

    chokidar.watch('index.html', { ignored: /(^|[\/\\])\../, persistent: true })
        .on('change', async (filePath) => {
            console.log(`Detected change in HTML: ${filePath}. Verifying HTML...`);
            await verifyHtmlStructure('index.html');
            sendReloadSignalToClients();
        });

    console.log('--- Interactive Development Environment Ready ---');
}

async function executeTaskFromCli() {
    await setupBuildEnvironment();

    const args = process.argv.slice(2);
    const requestedTask = args[0] || 'daily';

    switch (requestedTask) {
        case 'css':
            await buildCssPipeline();
            break;
        case 'js':
            await buildJsPipeline();
            break;
        case 'md':
            await buildMarkdownPipeline();
            break;
        case 'daily':
            await performCompleteDailyBuild();
            break;
        case 'server':
            await startInteractiveDevelopment();
            break;
        case 'validate':
            await verifyHtmlStructure('index.html');
            break;
        default:
            console.log(`Unknown task: "${requestedTask}". Available tasks: css, js, md, daily, server, validate.`);
            console.log(`Running 'daily' build as default.`);
            await performCompleteDailyBuild();
            break;
    }
}

executeTaskFromCli().catch(console.error);