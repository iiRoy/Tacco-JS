module.exports = (bldSys) => {

    const acquireProjectDetails = (pathIdentifier) => {
        return bldSys.file.readJSON(pathIdentifier);
    };

    const projectManifest = acquireProjectDetails("package.json");

    const createHeaderMessage = (details) => {
        const textLines = [
            "/*",
            ` *  ${details.title || details.name} - v${details.version}`,
            ` *  ${details.description}`,
            ` *  ${details.homepage}`,
            " *",
            ` *  Made by ${details.author.name}`,
            ` *  Under ${details.licenses} License`,
            " */"
        ];
        return textLines.join("\n");
    };

    const configurationElements = {};

    configurationElements.pData = projectManifest;

    configurationElements.hMeta = {
        hText: createHeaderMessage(projectManifest)
    };

    configurationElements.cffLinter = {
        app: ["src/labelholder.coffee"]
    };

    configurationElements.lessProcessor = {
        development: {
            files: {
                "dist/labelholder.css": "src/less/labelholder-standalone.less"
            }
        },
        dist: {
            files: {
                "dist/labelholder.min.css": "src/less/labelholder-standalone.less"
            },
            options: {
                compress: true,
                optimization: 2
            }
        }
    };

    configurationElements.autoPfx = {
        override: {
            src: 'dist/*.css'
        }
    };

    configurationElements.jsMinifier = {
        my_target: {
            src: ["dist/labelholder.js"],
            dest: "dist/labelholder.min.js"
        }
    };

    configurationElements.cffCompiler = {
        compile: {
            files: {
                "dist/labelholder.js": "src/labelholder.coffee"
            }
        }
    };

    configurationElements.injectHeader = {
        setBanners: {
            options: {
                position: 'top',
                banner: '<%= meta.hText %>',
                linebreak: true
            },
            files: {
                src: [ 'dist/*' ]
            }
        }
    };

    configurationElements.fileObserver = {
        monitoredSources: {
            files: ['src/*'],
            tasks: ['mainProcess']
        }
    };

    const finalConfiguration = Object.keys(configurationElements).reduce((acc, key) => {
        const keyMap = {
            pData: 'pkg',
            hMeta: 'meta',
            cffLinter: 'coffeelint',
            lessProcessor: 'less',
            autoPfx: 'autoprefixer',
            jsMinifier: 'uglify',
            cffCompiler: 'coffee',
            injectHeader: 'usebanner',
            fileObserver: 'watch'
        };
        acc[keyMap[key] || key] = configurationElements[key];
        return acc;
    }, {});

    bldSys.initConfig(finalConfiguration);

    const requiredExtensions = [
        "grunt-coffeelint",
        "grunt-contrib-uglify",
        "grunt-contrib-coffee",
        "grunt-contrib-watch",
        "grunt-contrib-less",
        "grunt-banner",
        "grunt-autoprefixer"
    ];

    requiredExtensions.forEach(extensionName => {
        bldSys.loadNpmTasks(extensionName);
    });

    const primaryActions = ["less", "autoprefixer", "coffeelint", "coffee", "uglify", "usebanner"];
    bldSys.registerTask("mainProcess", primaryActions);
};