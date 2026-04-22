'use strict';

const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const { WebSocketServer } = require('ws');
const chokidar = require('chokidar');
const jshint = require('jshint').JSHINT;
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminSvgo = require('imagemin-svgo');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const csso = require('csso');
const UglifyJS = require('uglify-js');
const uncss = require('uncss');
const htmlMinifier = require('html-minifier');
const cheerio = require('cheerio');
const pageSpeed = require('pagespeed-insights');

// --- Configuration Parameters ---
const PROJECT_ROOT_PATH = path.resolve(__dirname);
const SOURCE_CONTENT_PATH = path.join(PROJECT_ROOT_PATH, 'app');
const TEMPORARY_BUILD_PATH = path.join(PROJECT_ROOT_PATH, '.tmp');
const FINAL_DISTRIBUTION_PATH = path.join(PROJECT_ROOT_PATH, 'dist');

const JAVASCRIPT_SOURCE_PATTERNS = path.join(SOURCE_CONTENT_PATH, 'scripts', '**', '*.js');
const IMAGE_SOURCE_PATTERNS = path.join(SOURCE_CONTENT_PATH, 'images', '**', '*');
const FONT_SOURCE_PATTERNS = path.join(SOURCE_CONTENT_PATH, 'fonts', '**', '*');
const STYLESHEET_SOURCE_PATTERNS = [
  path.join(SOURCE_CONTENT_PATH, 'styles', '*.scss'),
  path.join(SOURCE_CONTENT_PATH, 'styles', '**', '*.css'),
  path.join(SOURCE_CONTENT_PATH, 'styles', 'bootstrap.scss')
];
const MARKUP_SOURCE_PATTERNS = path.join(SOURCE_CONTENT_PATH, '**', '*.html');
const ROOT_LEVEL_TRANSFER_ITEMS = [
  path.join(SOURCE_CONTENT_PATH, '*'),
  `!${path.join(SOURCE_CONTENT_PATH, '*.html')}`,
  path.join(PROJECT_ROOT_PATH, 'node_modules', 'apache-server-configs', 'dist', '.htaccess')
];

const AUTOPREFIXER_BROWSER_LIST = [
  'ie >= 10', 'ie_mob >= 10', 'ff >= 30', 'chrome >= 34', 'safari >= 7',
  'opera >= 23', 'ios >= 7', 'android >= 4.4', 'bb >= 10'
];

const PERFORMANCE_REPORT_URL = 'https://example.com';
const PERFORMANCE_REPORT_STRATEGY = 'mobile';

const DEVELOPMENT_SERVER_PORT = 3000;
const WEBSOCKET_RELOAD_PORT = 3001;

// --- Internal Utility Functions ---

/**
 * Outputs a message to the console with a prefix.
 * @param {string} message - The message string.
 */
function outputLog(message) {
  console.log(`[ProjectAutomation] ${message}`);
}

/**
 * Recursively finds files matching a simplified glob pattern within a base path.
 * Supports `**/*`, `*.ext`, and exclusion patterns `!pattern`.
 * @param {string} searchBase - The base directory to start the search.
 * @param {string[]} globPatterns - Array of glob patterns, e.g., ['app/**/*.js', '!app/ignore.js'].
 * @returns {Promise<string[]>} - A promise resolving to an array of absolute file paths.
 */
async function findMatchingFiles(searchBase, globPatterns) {
    let discoveredFiles = [];
    async function traverseDirectory(currentPath) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullEntryPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                await traverseDirectory(fullEntryPath);
            } else if (entry.isFile()) {
                discoveredFiles.push(fullEntryPath);
            }
        }
    }
    await traverseDirectory(searchBase);

    // Filter files based on glob patterns
    return discoveredFiles.filter(filePath => {
        let shouldInclude = false;
        let shouldExclude = false;
        const relativeFilePath = path.relative(PROJECT_ROOT_PATH, filePath);

        for (const pattern of globPatterns) {
            const isExclusion = pattern.startsWith('!');
            const actualPattern = isExclusion ? pattern.substring(1) : pattern;

            // Convert glob pattern relative to PROJECT_ROOT_PATH for matching
            const relativePattern = path.relative(PROJECT_ROOT_PATH, actualPattern);

            // Basic glob to regex conversion for `**/*` and `*.ext`
            let regexString = relativePattern
                .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
                .replace(/\*\*\//g, '(?:[^/]+/)*') // `**/` matches any number of directories
                .replace(/\*/g, '[^/]*'); // `*` matches any characters except `/`

            const regex = new RegExp(`^${regexString}$`);

            if (regex.test(relativeFilePath)) {
                if (isExclusion) {
                    shouldExclude = true;
                } else {
                    shouldInclude = true;
                }
            }
        }
        return shouldInclude && !shouldExclude;
    });
}

/**
 * Reads the content of multiple files.
 * @param {string[]} filePaths - An array of file paths.
 * @returns {Promise<string[]>} - A promise resolving to an array of file contents.
 */
async function retrieveFileContents(filePaths) {
  return Promise.all(filePaths.map(filePath => fs.readFile(filePath, 'utf8')));
}

/**
 * Writes content to a file, ensuring the parent directory exists.
 * @param {string} destinationPath - The absolute path to the output file.
 * @param {string|Buffer} contentData - The data to write to the file.
 */
async function storeFileContent(destinationPath, contentData) {
  await fs.ensureDir(path.dirname(destinationPath));
  await fs.writeFile(destinationPath, contentData);
}

// --- Project Automation Functions (replacing Gulp tasks) ---

/**
 * Deletes the temporary and final distribution directories.
 * (Corresponds to 'clean' gulp task)
 */
async function purgeBuildArtifacts() {
  outputLog('Initiating cleanup of temporary and distribution directories...');
  await fs.remove(TEMPORARY_BUILD_PATH);
  await fs.remove(FINAL_DISTRIBUTION_PATH);
  outputLog('Cleanup operation successfully concluded.');
}

/**
 * Analyzes JavaScript files for common errors and style issues.
 * (Corresponds to 'jshint' gulp task)
 */
async function conductCodeLinting() {
  outputLog('Commencing JavaScript code quality analysis...');
  const jsFiles = await findMatchingFiles(SOURCE_CONTENT_PATH, [JAVASCRIPT_SOURCE_PATTERNS]);
  let lintingFailed = false;

  const jshintOptions = {
    "browser": true,
    "esversion": 6,
    "globals": { "jQuery": false, "$" : false }
  };

  for (const scriptPath of jsFiles) {
    const code = await fs.readFile(scriptPath, 'utf8');
    const lintingResult = jshint(code, jshintOptions);

    if (!lintingResult) {
      lintingFailed = true;
      outputLog(`Linting errors detected in ${path.relative(PROJECT_ROOT_PATH, scriptPath)}:`);
      jshint.errors.forEach(issue => {
        if (issue) {
          outputLog(`  Line ${issue.line}, Col ${issue.character}: ${issue.reason} (${issue.code})`);
        }
      });
    }
  }

  if (lintingFailed) {
    outputLog('JavaScript analysis completed with detected issues.');
    // In a strict build environment, you might throw an error here to halt the process.
  } else {
    outputLog('JavaScript analysis completed without any issues.');
  }
}

/**
 * Optimizes image assets for web distribution.
 * (Corresponds to 'images' gulp task)
 */
async function optimizeVisualAssets() {
  outputLog('Starting optimization of image assets...');
  const imageFiles = await findMatchingFiles(SOURCE_CONTENT_PATH, [IMAGE_SOURCE_PATTERNS]);
  let optimizedCount = 0;

  await fs.ensureDir(path.join(FINAL_DISTRIBUTION_PATH, 'images'));

  for (const imagePath of imageFiles) {
    const relativePath = path.relative(SOURCE_CONTENT_PATH, imagePath);
    const outputPath = path.join(FINAL_DISTRIBUTION_PATH, 'images', relativePath);
    await fs.ensureDir(path.dirname(outputPath));

    const originalBuffer = await fs.readFile(imagePath);
    const processedBuffer = await imagemin.buffer(originalBuffer, {
      plugins: [
        imageminJpegtran({ progressive: true }),
        imageminPngquant({ quality: [0.6, 0.8] }),
        imageminGifsicle({ interlaced: true }),
        imageminSvgo()
      ]
    });
    await fs.writeFile(outputPath, processedBuffer);
    optimizedCount++;
  }
  outputLog(`Successfully optimized ${optimizedCount} image assets.`);
}

/**
 * Copies selected root-level files from source to distribution.
 * (Corresponds to 'copy' gulp task)
 */
async function transferRootFiles() {
  outputLog('Commencing transfer of static root files...');
  await fs.ensureDir(FINAL_DISTRIBUTION_PATH);

  const allAppRootEntries = await fs.readdir(SOURCE_CONTENT_PATH, { withFileTypes: true });
  const filesForTransfer = [];

  for (const entry of allAppRootEntries) {
      const fullEntryPath = path.join(SOURCE_CONTENT_PATH, entry.name);
      if (entry.isFile()) {
          let includedByPattern = false;
          let excludedByPattern = false;

          for (const pattern of ROOT_LEVEL_TRANSFER_ITEMS) {
              const isExclusion = pattern.startsWith('!');
              const actualPattern = isExclusion ? pattern.substring(1) : pattern;
              const relativePattern = path.relative(SOURCE_CONTENT_PATH, actualPattern);
              const relativeEntryPath = path.relative(SOURCE_CONTENT_PATH, fullEntryPath);

              // Simple string matching for root files
              if (relativePattern === '*') { // Matches all files in source root
                  if (!isExclusion) includedByPattern = true;
              } else if (relativePattern === '*.html') { // Matches HTML files in source root
                  if (relativeEntryPath.endsWith('.html')) {
                      if (isExclusion) excludedByPattern = true;
                  }
              }
          }
          if (includedByPattern && !excludedByPattern) {
              filesForTransfer.push(fullEntryPath);
          }
      }
  }

  // Explicitly add .htaccess from node_modules
  const htaccessSourcePath = path.join(PROJECT_ROOT_PATH, 'node_modules', 'apache-server-configs', 'dist', '.htaccess');
  if (await fs.pathExists(htaccessSourcePath)) {
      filesForTransfer.push(htaccessSourcePath);
  }

  let transferredCount = 0;
  for (const filePath of filesForTransfer) {
      const fileName = path.basename(filePath);
      const destinationPath = path.join(FINAL_DISTRIBUTION_PATH, fileName);
      await fs.copy(filePath, destinationPath);
      transferredCount++;
  }
  outputLog(`Transferred ${transferredCount} static root files.`);
}

/**
 * Copies font files to the distribution directory.
 * (Corresponds to 'fonts' gulp task)
 */
async function transferWebFonts() {
  outputLog('Initiating transfer of web fonts...');
  const fontFiles = await findMatchingFiles(SOURCE_CONTENT_PATH, [FONT_SOURCE_PATTERNS]);
  await fs.ensureDir(path.join(FINAL_DISTRIBUTION_PATH, 'fonts'));
  let copiedItems = 0;

  for (const fontPath of fontFiles) {
    const relativePath = path.relative(SOURCE_CONTENT_PATH, fontPath);
    const outputPath = path.join(FINAL_DISTRIBUTION_PATH, 'fonts', relativePath);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.copy(fontPath, outputPath);
    copiedItems++;
  }
  outputLog(`Transferred ${copiedItems} web fonts.`);
}

/**
 * Compiles Sass, autoprefixes, and minifies stylesheets.
 * (Corresponds to 'styles' gulp task)
 */
async function processAllStylesheets() {
  outputLog('Executing stylesheet processing pipeline...');
  const scssInputFiles = await findMatchingFiles(SOURCE_CONTENT_PATH, [
    path.join(SOURCE_CONTENT_PATH, 'styles', '*.scss'),
    path.join(SOURCE_CONTENT_PATH, 'styles', 'bootstrap.scss')
  ]);
  const cssInputFiles = await findMatchingFiles(SOURCE_CONTENT_PATH, [path.join(SOURCE_CONTENT_PATH, 'styles', '**', '*.css')]);

  await fs.ensureDir(path.join(TEMPORARY_BUILD_PATH, 'styles'));
  await fs.ensureDir(path.join(FINAL_DISTRIBUTION_PATH, 'styles'));

  const intermediateCssContentMap = {}; // Store CSS content by source path for further processing

  // Phase 1: Compile Sass files
  for (const scssFilePath of scssInputFiles) {
    const outputFileName = path.basename(scssFilePath, path.extname(scssFilePath)) + '.css';
    const tempOutputPath = path.join(TEMPORARY_BUILD_PATH, 'styles', outputFileName);

    outputLog(`Compiling Sass: ${path.relative(PROJECT_ROOT_PATH, scssFilePath)}`);
    try {
      const compilationResult = sass.renderSync({
        file: scssFilePath,
        outputStyle: 'expanded',
        precision: 10,
        includePaths: [path.join(SOURCE_CONTENT_PATH, 'styles')]
      });
      intermediateCssContentMap[scssFilePath] = compilationResult.css.toString();
      await storeFileContent(tempOutputPath, compilationResult.css);
    } catch (error) {
      console.error(`Error during Sass compilation for ${path.relative(PROJECT_ROOT_PATH, scssFilePath)}:`, error);
      throw error;
    }
  }

  // Phase 2: Copy existing CSS files to temporary directory
  for (const cssFilePath of cssInputFiles) {
    const relativePath = path.relative(SOURCE_CONTENT_PATH, cssFilePath);
    const tempOutputPath = path.join(TEMPORARY_BUILD_PATH, 'styles', relativePath);
    const content = await fs.readFile(cssFilePath, 'utf8');
    intermediateCssContentMap[cssFilePath] = content;
    await storeFileContent(tempOutputPath, content);
  }

  // Phase 3: Autoprefix and Minify all CSS files in temporary directory
  const allTempCssFiles = await findMatchingFiles(TEMPORARY_BUILD_PATH, [path.join(TEMPORARY_BUILD_PATH, 'styles', '**', '*.css')]);
  let processedFilesCount = 0;

  for (const cssFileTempPath of allTempCssFiles) {
    let currentCssContent = await fs.readFile(cssFileTempPath, 'utf8');

    // Autoprefix
    const autoprefixedResult = await postcss([autoprefixer({ browsers: AUTOPREFIXER_BROWSER_LIST })]).process(currentCssContent, { from: cssFileTempPath, to: cssFileTempPath });
    currentCssContent = autoprefixedResult.css;

    // Minify
    const minifiedCss = csso.minify(currentCssContent).css;

    const relativePath = path.relative(TEMPORARY_BUILD_PATH, cssFileTempPath);
    const finalOutputPath = path.join(FINAL_DISTRIBUTION_PATH, relativePath);
    await storeFileContent(finalOutputPath, minifiedCss);
    processedFilesCount++;
  }

  outputLog(`Processed and minified ${processedFilesCount} stylesheet files.`);
}

/**
 * Transforms HTML files, processes embedded assets (JS/CSS), and minifies HTML.
 * (Corresponds to 'html' gulp task)
 */
async function processWebMarkup() {
  outputLog('Initiating transformation of HTML markup...');
  const htmlInputFiles = await findMatchingFiles(SOURCE_CONTENT_PATH, [MARKUP_SOURCE_PATTERNS]);

  const collectedJsBundles = {};   // { outputFilePath: [sourceFilePath1, ...] }
  const collectedCssBundles = {};  // { outputFilePath: [sourceFilePath1, ...] }
  const originalHtmlContents = {}; // { htmlFilePath: content }

  // First Pass: Parse HTML to collect asset build blocks
  for (const htmlFilePath of htmlInputFiles) {
    const fileContent = await fs.readFile(htmlFilePath, 'utf8');
    originalHtmlContents[htmlFilePath] = fileContent;

    const $ = cheerio.load(fileContent);
    $('head, body').each((i, element) => {
      // Find custom JS build blocks (e.g., <script data-bundle="js:scripts/main.js" src="scripts/one.js"></script>)
      $(element).find('script[data-bundle]').each((j, scriptElement) => {
        const bundleAttribute = $(scriptElement).attr('data-bundle');
        if (bundleAttribute && bundleAttribute.startsWith('js:')) {
          const outputKey = bundleAttribute.substring('js:'.length);
          const scriptSource = $(scriptElement).attr('src');
          if (scriptSource) {
            collectedJsBundles[outputKey] = collectedJsBundles[outputKey] || [];
            collectedJsBundles[outputKey].push(path.join(SOURCE_CONTENT_PATH, scriptSource));
          }
        }
      });

      // Find custom CSS build blocks (e.g., <link data-bundle="css:styles/main.css" href="styles/one.css">)
      $(element).find('link[data-bundle]').each((j, linkElement) => {
        const bundleAttribute = $(linkElement).attr('data-bundle');
        if (bundleAttribute && bundleAttribute.startsWith('css:')) {
          const outputKey = bundleAttribute.substring('css:'.length);
          const linkHref = $(linkElement).attr('href');
          if (linkHref) {
            collectedCssBundles[outputKey] = collectedCssBundles[outputKey] || [];
            collectedCssBundles[outputKey].push(path.join(SOURCE_CONTENT_PATH, linkHref));
          }
        }
      });
    });
  }

  // Phase 2: Process collected JavaScript assets
  const processedJsOutputs = {}; // { outputFilePath: processedContent }
  for (const outputBundlePath in collectedJsBundles) {
    const sourceFilePaths = collectedJsBundles[outputBundlePath];
    const contents = await retrieveFileContents(sourceFilePaths);
    const concatenatedContent = contents.join('\n');
    const minificationResult = UglifyJS.minify(concatenatedContent, {
      compress: {}, // Default compression
      mangle: true, // Mangle variable names
      comments: /@preserve|@license|@cc_on/i // Preserve some comments
    });

    if (minificationResult.error) {
      console.error(`Error minifying JavaScript bundle ${outputBundlePath}:`, minificationResult.error);
      throw minificationResult.error;
    }
    processedJsOutputs[outputBundlePath] = minificationResult.code;
    await storeFileContent(path.join(FINAL_DISTRIBUTION_PATH, outputBundlePath), minificationResult.code);
  }

  // Phase 3: Process collected CSS assets
  const processedCssOutputs = {}; // { outputFilePath: processedContent }
  for (const outputBundlePath in collectedCssBundles) {
    const sourceFilePaths = collectedCssBundles[outputBundlePath];
    const contents = await retrieveFileContents(sourceFilePaths);
    let concatenatedContent = contents.join('\n');

    // UnCSS: Remove unused CSS
    const uncssHtmlSources = [
      path.join(SOURCE_CONTENT_PATH, 'index.html'),
      path.join(SOURCE_CONTENT_PATH, 'styleguide.html')
    ];
    const uncssIgnoreSelectors = [
      /.navdrawer-container.open/,
      /.app-bar.open/
    ];

    try {
      concatenatedContent = await uncss(concatenatedContent, {
        html: uncssHtmlSources,
        ignore: uncssIgnoreSelectors
      });
    } catch (error) {
      console.warn(`Warning: Failed to remove unused CSS for ${outputBundlePath}. Proceeding without UnCSS.`, error.message);
    }

    // Minify CSS
    const minifiedCss = csso.minify(concatenatedContent).css;
    processedCssOutputs[outputBundlePath] = minifiedCss;
    await storeFileContent(path.join(FINAL_DISTRIBUTION_PATH, outputBundlePath), minifiedCss);
  }

  // Phase 4: Replace build blocks in HTML, update paths, and minify HTML
  let transformedHtmlCount = 0;
  for (const originalHtmlPath of htmlInputFiles) {
    let htmlString = originalHtmlContents[originalHtmlPath];
    const $ = cheerio.load(htmlString);

    $('head, body').each((i, element) => {
      // Replace JS build blocks with a single script tag
      $(element).find('script[data-bundle]').each((j, scriptElement) => {
        const bundleAttribute = $(scriptElement).attr('data-bundle');
        if (bundleAttribute && bundleAttribute.startsWith('js:')) {
          const outputKey = bundleAttribute.substring('js:'.length);
          if (processedJsOutputs[outputKey]) {
            $(scriptElement).replaceWith(`<script src="${outputKey}"></script>`);
          }
        }
      });

      // Replace CSS build blocks with a single link tag
      $(element).find('link[data-bundle]').each((j, linkElement) => {
        const bundleAttribute = $(linkElement).attr('data-bundle');
        if (bundleAttribute && bundleAttribute.startsWith('css:')) {
          const outputKey = bundleAttribute.substring('css:'.length);
          if (processedCssOutputs[outputKey]) {
            $(linkElement).replaceWith(`<link rel="stylesheet" href="${outputKey}">`);
          }
        }
      });
    });

    // Specific replacement for 'bootstrap.css' to 'bootstrap.min.css'
    // This is a global string replacement on the final HTML content.
    let finalHtmlContent = $.html();
    finalHtmlContent = finalHtmlContent.replace(/bootstrap\.css/g, 'bootstrap.min.css');

    // Minify HTML
    const minifiedHtml = htmlMinifier.minify(finalHtmlContent, {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true
    });

    const relativePath = path.relative(SOURCE_CONTENT_PATH, originalHtmlPath);
    const outputPath = path.join(FINAL_DISTRIBUTION_PATH, relativePath);
    await storeFileContent(outputPath, minifiedHtml);
    transformedHtmlCount++;
  }
  outputLog(`Successfully transformed ${transformedHtmlCount} HTML files.`);
}

/**
 * Orchestrates the full project build process for production.
 * (Corresponds to 'default' gulp task)
 */
async function buildProductionProject(completionCallback) {
  outputLog('Starting comprehensive project build...');
  try {
    await purgeBuildArtifacts();
    await conductCodeLinting();
    await processAllStylesheets(); // Styles can be built while other assets are prepared
    await Promise.all([
      processWebMarkup(),
      optimizeVisualAssets(),
      transferWebFonts(),
      transferRootFiles()
    ]);
    outputLog('Project build successfully completed.');
    if (completionCallback) completionCallback();
  } catch (error) {
    console.error('Project build encountered an error:', error);
    if (completionCallback) completionCallback(error);
    process.exit(1); // Exit with error code
  }
}

// --- Server and Watch Functions (replacing 'serve' and 'serve:dist' gulp tasks) ---

let activeWebServer = null;
let activeWebSocketServer = null;
let activeFileWatcher = null;
let currentServedRootPath = null;

/**
 * Starts a basic HTTP server.
 * @param {string} rootDirectory - The root path to serve files from.
 * @param {number} serverPort - The port for the HTTP server.
 * @param {boolean} injectLiveReload - Whether to inject a live reload script into HTML.
 */
async function startWebServer(rootDirectory, serverPort, injectLiveReload) {
  if (activeWebServer) {
    activeWebServer.close(() => outputLog('Shutting down previous HTTP server.'));
    if (activeWebSocketServer) activeWebSocketServer.close(() => outputLog('Shutting down previous WebSocket server.'));
    if (activeFileWatcher) activeFileWatcher.close(() => outputLog('Shutting down previous file watcher.'));
  }

  currentServedRootPath = rootDirectory;

  activeWebServer = http.createServer(async (request, response) => {
    let requestedFilePath = path.join(rootDirectory, request.url === '/' ? 'index.html' : request.url);
    const fileExtension = path.extname(requestedFilePath);
    let contentType = 'text/html';

    switch (fileExtension) {
      case '.js': contentType = 'text/javascript'; break;
      case '.css': contentType = 'text/css'; break;
      case '.json': contentType = 'application/json'; break;
      case '.png': contentType = 'image/png'; break;
      case '.jpg': contentType = 'image/jpeg'; break;
      case '.gif': contentType = 'image/gif'; break;
      case '.svg': contentType = 'image/svg+xml'; break;
      case '.ico': contentType = 'image/x-icon'; break;
    }

    try {
      let fileContent = await fs.readFile(requestedFilePath);
      if (injectLiveReload && contentType === 'text/html') {
        const reloadClientScript = `<script>
          var wsClient = new WebSocket('ws://localhost:${WEBSOCKET_RELOAD_PORT}');
          wsClient.onmessage = function (event) {
            if (event.data === 'reload') {
              window.location.reload();
            }
          };
          console.log('Live reload client initialized.');
        </script>`;
        fileContent = fileContent.toString().replace(/<\/body>/, `${reloadClientScript}</body>`);
      }
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(fileContent, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(404);
        response.end('404 Resource Not Found');
      } else {
        response.writeHead(500);
        response.end('500 Server Error: ' + error.message);
      }
    }
  });

  activeWebServer.listen(serverPort, () => {
    outputLog(`HTTP server operational at http://localhost:${serverPort} serving from ${path.relative(PROJECT_ROOT_PATH, rootDirectory)}`);
  });

  if (injectLiveReload) {
    activeWebSocketServer = new WebSocketServer({ port: WEBSOCKET_RELOAD_PORT });
    activeWebSocketServer.on('connection', ws => {
      outputLog('Live reload client established WebSocket connection.');
    });
    activeWebSocketServer.on('error', error => {
      console.error('WebSocket server error:', error);
    });
  }
}

/**
 * Broadcasts a reload signal to all connected WebSocket clients.
 */
function triggerClientReload() {
  if (activeWebSocketServer) {
    activeWebSocketServer.clients.forEach(client => {
      if (client.readyState === WebSocketServer.OPEN) {
        client.send('reload');
      }
    });
    outputLog('Broadcasted reload command to connected clients.');
  }
}

/**
 * Starts a development server with live reload and watches for file changes.
 * (Corresponds to 'serve' gulp task)
 */
async function launchDevelopmentEnvironment() {
  outputLog('Launching development server with live reload...');
  await processAllStylesheets(); // Initial build of styles
  await startWebServer(TEMPORARY_BUILD_PATH, DEVELOPMENT_SERVER_PORT, true); // Serve from .tmp

  // Watch for changes in source files
  activeFileWatcher = chokidar.watch([
    path.join(SOURCE_CONTENT_PATH, '**', '*.html'),
    path.join(SOURCE_CONTENT_PATH, 'styles', '**', '*.{scss,css}'),
    path.join(SOURCE_CONTENT_PATH, 'scripts', '**', '*.js'),
    path.join(SOURCE_CONTENT_PATH, 'images', '**', '*')
  ], { ignored: /node_modules/, persistent: true });

  activeFileWatcher.on('change', async (changedFilePath) => {
    outputLog(`Detected file change: ${path.relative(PROJECT_ROOT_PATH, changedFilePath)}`);
    if (changedFilePath.endsWith('.html')) {
      // HTML changes often require a full page reload for consistency
      triggerClientReload();
    } else if (changedFilePath.match(/\.(scss|css)$/)) {
      await processAllStylesheets(); // Recompile/process stylesheets
      triggerClientReload();
    } else if (changedFilePath.endsWith('.js')) {
      await conductCodeLinting(); // Re-lint JavaScript
      triggerClientReload();
    } else if (changedFilePath.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
      // For images, a simple reload is usually sufficient in dev mode
      triggerClientReload();
    }
  });
  outputLog('File watcher initialized and monitoring source files...');
}

/**
 * Starts a server to serve the production build.
 * (Corresponds to 'serve:dist' gulp task)
 */
async function launchProductionServer() {
  outputLog('Launching server for production build...');
  await buildProductionProject(); // Ensure project is built before serving
  await startWebServer(FINAL_DISTRIBUTION_PATH, DEVELOPMENT_SERVER_PORT, false); // Serve from dist, no live reload
}

/**
 * Executes a PageSpeed Insights report for the configured URL.
 * (Corresponds to 'pagespeed' gulp task)
 */
async function generatePerformanceReport() {
  outputLog('Requesting PageSpeed Insights report...');
  try {
    const reportData = await pageSpeed(PERFORMANCE_REPORT_URL, { strategy: PERFORMANCE_REPORT_STRATEGY });
    outputLog(`PageSpeed Insights Report for ${PERFORMANCE_REPORT_URL} (Strategy: ${PERFORMANCE_REPORT_STRATEGY}):`);
    outputLog(JSON.stringify(reportData.rules, null, 2));
    outputLog(`Overall Score: ${reportData.ruleGroups.SPEED.score}`);
  } catch (error) {
    console.error('Failed to retrieve PageSpeed Insights report:', error.message);
  }
}

// --- Main Command Execution Logic ---

async function executeAutomationCommand() {
  const cliArguments = process.argv.slice(2);
  const requestedCommand = cliArguments[0];

  switch (requestedCommand) {
    case 'lint-js':
      await conductCodeLinting();
      break;
    case 'optimize-images':
      await optimizeVisualAssets();
      break;
    case 'copy-root-files':
      await transferRootFiles();
      break;
    case 'copy-fonts':
      await transferWebFonts();
      break;
    case 'process-css':
      await processAllStylesheets();
      break;
    case 'process-html':
      await processWebMarkup();
      break;
    case 'clean-build':
      await purgeBuildArtifacts();
      break;
    case 'dev-mode':
      await launchDevelopmentEnvironment();
      break;
    case 'dist-mode':
      await launchProductionServer();
      break;
    case 'build':
    case undefined: // Default command if none specified
      await buildProductionProject();
      break;
    case 'check-performance':
      await generatePerformanceReport();
      break;
    default:
      console.log(`Unknown command: "${requestedCommand}"`);
      console.log('Available commands: lint-js, optimize-images, copy-root-files, copy-fonts, process-css, process-html, clean-build, dev-mode, dist-mode, build (default), check-performance');
      process.exit(1);
  }
}

executeAutomationCommand().catch(error => {
  console.error('An unhandled automation error occurred:', error);
  process.exit(1);
});