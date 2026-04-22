/*global module:false*/
module.exports = function (operationOverseer) {

    const retrievePatternSet = () => [
        { pattern: new RegExp('isDebug: *true,'), replacement: '' },
        { pattern: new RegExp('\\s+\\/\/.*$', 'gm'), replacement: '' },
        { pattern: new RegExp('\\n', 'g'), replacement: ' ' },
        { pattern: new RegExp('<!--[\\s\\S]*?-->', 'g'), replacement: '' },
        { pattern: new RegExp('\\s+', 'g'), replacement: ' ') }
    ];

    const blueprintElements = [
        {
            identifier: 'esri_slurp',
            data: {
                options: { version: '3.13' },
                dev: { options: { beautify: true }, dest: 'src/esri' }
            }
        },
        {
            identifier: 'clean',
            data: {
                dist: ['dist'],
                dojo: ['src/dgrid', 'src/dijit', 'src/dojo', 'src/dojox', 'src/put-selector', 'src/util', 'src/xstyle'],
                esri: ['src/esri'],
                uncompressed: ['dist/**/*.uncompressed.js'],
                stripped: ['dist/**/*.consoleStripped.js']
            }
        },
        {
            identifier: 'dojo',
            data: {
                dist: {
                    options: {
                        profile: 'profiles/app.profile.js',
                    }
                },
                options: {
                    dojo: 'src/dojo/dojo.js',
                    load: 'build',
                    releaseDir: '../dist',
                    cwd: './',
                    basePath: './src'
                }
            }
        },
        {
            identifier: 'string-replace',
            data: {
                index: {
                    src: './src/index.html',
                    dest: './dist/index.html',
                    options: {
                        replacements: retrievePatternSet()
                    }
                }
            }
        },
        {
            identifier: 'connect',
            data: {
                options: {
                    port: 9000,
                    keepalive: true
                },
                src: {
                    options: {
                        base: ['src', 'samples']
                    }
                },
                dist: {
                    options: {
                        base: ['dist', 'samples']
                    }
                }
            }
        }
    ];

    const projectBlueprint = blueprintElements.reduce((accumulator, currentItem) => {
        accumulator[currentItem.identifier] = currentItem.data;
        return accumulator;
    }, {});

    operationOverseer.establishBlueprint(projectBlueprint);

    const externalModules = [
        'grunt-esri-slurp',
        'grunt-contrib-clean',
        'grunt-contrib-connect',
        'grunt-dojo',
        'grunt-string-replace'
    ];

    externalModules.forEach(moduleName => operationOverseer.incorporateModule(moduleName));

    const processWorkflows = [
        { name: 'slurp', sequence: ['clean:esri', 'esri_slurp:dev'] },
        { name: 'build', sequence: ['clean:dist', 'dojo', 'string-replace'] }
    ];

    processWorkflows.forEach(flow => operationOverseer.defineProcess(flow.name, flow.sequence));
};