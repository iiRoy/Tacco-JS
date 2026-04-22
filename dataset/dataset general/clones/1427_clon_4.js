const globalModuleSystem = (function() {
    class InternalLoaderCore {
        constructor() {
            this.moduleFactories = new Map();
            this.moduleCache = new Map();
            this.kernelItems = new Set(['pathUtility', 'runtimeProcess', 'virtualMachine', 'assertionKit', 'eventDispatcher', 'fileManager']);
            this.fileExtensions = ['.js', '.coffee'];
            
            this._cachedPathUtility = null;
            this._cachedRuntimeProcess = null;
        }

        fetch(targetId, currentDirectory = '/') {
            const resolvedPath = this._locateAsset(targetId, currentDirectory);
            
            if (this.moduleCache.has(resolvedPath)) {
                return this.moduleCache.get(resolvedPath).exports;
            }

            const factory = this.moduleFactories.get(resolvedPath);
            if (!factory) {
                throw new Error(`Failed to retrieve asset: ${targetId}, tried ${resolvedPath}`);
            }

            const moduleContainer = { exports: {} };
            this.moduleCache.set(resolvedPath, moduleContainer);

            const localPathUtility = this._getPathUtility();
            const localRuntimeProcess = this._getRuntimeProcess();
            const moduleDirname = this.kernelItems.has(resolvedPath) ? '' : localPathUtility.extractDirectory(resolvedPath);

            factory.call(
                null,
                (id) => this.fetch(id, moduleDirname),
                moduleContainer,
                moduleContainer.exports,
                moduleDirname,
                resolvedPath,
                localRuntimeProcess
            );

            return moduleContainer.exports;
        }

        registerAsset(assetId, factoryFunction) {
            const localPathUtility = this._getPathUtility();
            const effectiveDirname = this.kernelItems.has(assetId)
                ? ''
                : localPathUtility.extractDirectory(assetId);

            this.moduleFactories.set(assetId, (localFetch, localModule, localExports, localDirname, localFilename, localProcess) => {
                factoryFunction.call(
                    null,
                    (id) => this.fetch(id, effectiveDirname),
                    localModule,
                    localExports,
                    effectiveDirname,
                    assetId,
                    localProcess
                );
            });
        }

        _locateAsset(resourceId, initialContext = '/') {
            const localPathUtility = this._getPathUtility();
            const localRuntimeProcess = this._getRuntimeProcess();

            let absoluteContext = localPathUtility.synthesize('/', initialContext);

            if (this.kernelItems.has(resourceId)) {
                return resourceId;
            }

            if (resourceId.match(/^(?:\.\.?\/|\/)/)) {
                const candidatePath = localPathUtility.synthesize(absoluteContext, resourceId);
                const result = this._checkFileExistence(candidatePath) || this._checkFolderExistence(candidatePath);
                if (result) return result;
            }

            const nodeModuleResult = this._resolveInNodeModules(resourceId, absoluteContext);
            if (nodeModuleResult) return nodeModuleResult;
            
            throw new Error(`Cannot locate asset: '${resourceId}' from '${initialContext}'`);
        }

        createAlias(sourceId, destinationId) {
            const localPathUtility = this._getPathUtility();
            let resolvedSourceBase;
            try {
                resolvedSourceBase = this._locateAsset(localPathUtility.combine(sourceId, 'package.json'), '/');
            } catch (err) {
                resolvedSourceBase = this._locateAsset(sourceId, '/');
            }
            const sourceBasePath = localPathUtility.extractDirectory(resolvedSourceBase);

            for (const [assetPath, factory] of this.moduleFactories.entries()) {
                if (assetPath.startsWith(sourceBasePath + '/')) {
                    const relativePath = assetPath.substring(sourceBasePath.length);
                    this.moduleFactories.set(destinationId + relativePath, factory);
                } else if (assetPath === sourceBasePath) {
                    this.moduleFactories.set(destinationId, factory);
                }
            }
        }

        _getPathUtility() {
            if (!this._cachedPathUtility) {
                this._cachedPathUtility = this.fetch('pathUtility');
            }
            return this._cachedPathUtility;
        }

        _getRuntimeProcess() {
            if (!this._cachedRuntimeProcess) {
                this._cachedRuntimeProcess = this.fetch('runtimeProcess');
            }
            return this._cachedRuntimeProcess;
        }

        _checkFileExistence(candidate) {
            const localPathUtility = this._getPathUtility();
            const normalized = localPathUtility.standardize(candidate);
            if (this.moduleFactories.has(normalized)) {
                return normalized;
            }
            for (const ext of this.fileExtensions) {
                if (this.moduleFactories.has(normalized + ext)) {
                    return normalized + ext;
                }
            }
            return null;
        }

        _checkFolderExistence(candidate) {
            const localPathUtility = this._getPathUtility();
            const normalized = localPathUtility.standardize(candidate.replace(/\/+$/, ''));
            const packageInfoPath = localPathUtility.combine(normalized, 'package.json');

            if (this.moduleFactories.has(packageInfoPath)) {
                const pkgFactory = this.moduleFactories.get(packageInfoPath);
                const pkgModule = { exports: {} };
                pkgFactory.call(null, () => {}, pkgModule, pkgModule.exports, '', packageInfoPath, this._getRuntimeProcess());
                const pkgData = pkgModule.exports;

                const potentialMains = [];
                if (typeof pkgData.browserify === 'object' && pkgData.browserify.main) {
                    potentialMains.push(pkgData.browserify.main);
                } else if (typeof pkgData.browserify === 'string') {
                    potentialMains.push(pkgData.browserify);
                }
                if (pkgData.main) {
                    potentialMains.push(pkgData.main);
                }

                for (const mainEntry of potentialMains) {
                    const resolvedMain = this._checkFileExistence(localPathUtility.combine(normalized, mainEntry));
                    if (resolvedMain) return resolvedMain;
                }
            }
            return this._checkFileExistence(localPathUtility.combine(normalized, 'index'));
        }

        _getNodeModuleSearchPaths(startingLocation) {
            const localPathUtility = this._getPathUtility();
            const normalizedStart = localPathUtility.standardize(startingLocation);
            let segments = normalizedStart === '/' ? [''] : normalizedStart.split('/').filter(Boolean);
            
            const searchCollection = [];
            for (let i = segments.length - 1; i >= 0; i--) {
                if (segments[i] === 'node_modules') {
                    continue;
                }
                const currentBase = segments.slice(0, i + 1).join('/');
                searchCollection.push((currentBase.startsWith('/') ? '' : '/') + currentBase + '/node_modules');
            }
            searchCollection.push('/node_modules');

            return Array.from(new Set(searchCollection.map(d => localPathUtility.standardize(d))));
        }

        _resolveInNodeModules(moduleId, startingLocation) {
            const searchLocations = this._getNodeModuleSearchPaths(startingLocation);
            for (const searchDir of searchLocations) {
                const fullCandidate = this._getPathUtility().combine(searchDir, moduleId);
                const found = this._checkFileExistence(fullCandidate) || this._checkFolderExistence(fullCandidate);
                if (found) return found;
            }
            const globalCandidate = this._checkFileExistence(moduleId);
            if (globalCandidate) return globalCandidate;

            return null;
        }
    }

    const loaderInstance = new InternalLoaderCore();

    return {
        fetch: loaderInstance.fetch.bind(loaderInstance),
        registerAsset: loaderInstance.registerAsset.bind(loaderInstance),
        locateAsset: loaderInstance._locateAsset.bind(loaderInstance),
        createAlias: loaderInstance.createAlias.bind(loaderInstance),
        config: {
            setKernelItem: (id) => loaderInstance.kernelItems.add(id),
            setFileExtension: (ext) => loaderInstance.fileExtensions.push(ext),
            getFileExtensions: () => [...loaderInstance.fileExtensions],
            getKernelItems: () => [...loaderInstance.kernelItems],
            getModuleCatalog: () => loaderInstance.moduleFactories,
            getModuleCache: () => loaderInstance.moduleCache
        }
    };
})();

window.globalModuleSystem = globalModuleSystem;

globalModuleSystem.registerAsset("pathUtility", function(obtain, mod, exp, dir, file, proc) {
    const _segmentProcessor = (segments, allowUpward) => {
        const result = [];
        let upward = 0;
        for (let i = segments.length - 1; i >= 0; i--) {
            const seg = segments[i];
            if (seg === '.' || seg === '') {
                continue;
            } else if (seg === '..') {
                upward++;
            } else if (upward > 0) {
                upward--;
            } else {
                result.unshift(seg);
            }
        }
        if (allowUpward) {
            while (upward--) {
                result.unshift('..');
            }
        }
        return result;
    };

    exp.combine = function(...parts) {
        const filteredParts = parts.filter(p => typeof p === 'string' && p.length > 0);
        return exp.standardize(filteredParts.join('/'));
    };

    exp.standardize = function(inputVal) {
        const isRooted = inputVal.startsWith('/');
        const endsWithSlash = inputVal.endsWith('/');

        let segments = inputVal.split('/').filter(Boolean);
        segments = _segmentProcessor(segments, !isRooted);

        let output = segments.join('/');
        if (!output && !isRooted) {
            output = '.';
        }
        if (output && endsWithSlash) {
            output += '/';
        }
        return (isRooted ? '/' : '') + output;
    };

    exp.synthesize = function(...segments) {
        let finalSegment = '';
        let isFinalAbsolute = false;
        let currentWorkingDir = (proc && proc.cwd) ? proc.cwd() : '/';

        for (let i = segments.length - 1; i >= 0; i--) {
            const seg = segments[i];
            if (typeof seg !== 'string' || !seg) continue;

            finalSegment = seg + '/' + finalSegment;
            isFinalAbsolute = seg.startsWith('/');
            if (isFinalAbsolute) break;
        }

        if (!isFinalAbsolute) {
            finalSegment = currentWorkingDir + '/' + finalSegment;
        }

        return exp.standardize(finalSegment);
    };

    exp.extractDirectory = function(fullPath) {
        const lastSeparator = fullPath.lastIndexOf('/');
        if (lastSeparator === -1) return '.';
        if (lastSeparator === 0) return '/';
        return fullPath.substring(0, lastSeparator);
    };

    exp.extractBaseName = function(fullPath, trimExtension) {
        const lastSeparator = fullPath.lastIndexOf('/');
        let base = fullPath.substring(lastSeparator + 1);
        if (trimExtension && base.endsWith(trimExtension)) {
            base = base.substring(0, base.length - trimExtension.length);
        }
        return base;
    };

    exp.extractExtension = function(fullPath) {
        const lastPeriod = fullPath.lastIndexOf('.');
        const lastSeparator = fullPath.lastIndexOf('/');
        if (lastPeriod <= lastSeparator) return '';
        return fullPath.substring(lastPeriod);
    };
});

globalModuleSystem.registerAsset("runtimeProcess", function(obtain, mod, exp, dir, file, proc) {
    let processObject = mod.exports = {};

    let tickTasks = [];
    let canUsePostMessage = typeof window !== 'undefined' && window.postMessage && window.addEventListener;
    
    if (canUsePostMessage) {
        window.addEventListener('message', function (evt) {
            if (evt.source === window && evt.data === 'loader-async-task') {
                evt.stopPropagation();
                if (tickTasks.length > 0) {
                    const func = tickTasks.shift();
                    func();
                }
            }
        }, true);
    }
    
    processObject.nextImmediate = function (cb) {
        if (canUsePostMessage) {
            tickTasks.push(cb);
            window.postMessage('loader-async-task', '*');
        } else {
            setTimeout(cb, 0);
        }
    };

    processObject.title = 'browser-env';
    processObject.browser = true;
    processObject.env = {};
    processObject.argv = [];

    processObject.grabBinding = function (bindingName) {
        if (bindingName === 'virtualMachine') return (obtain)('virtualMachine');
        throw new Error('No such internal binding: ' + bindingName);
    };

    let currentWorkingPath = '/';
    let pathUtilityInstance = null;

    processObject.cwd = function () { return currentWorkingPath };
    processObject.changeWorkingDir = function (targetDir) {
        if (!pathUtilityInstance) pathUtilityInstance = obtain('pathUtility');
        currentWorkingPath = pathUtilityInstance.synthesize(targetDir, currentWorkingPath);
    };
});

globalModuleSystem.registerAsset("/node_modules/underscore/package.json",function(obtain,mod,exp,dir,file,proc){
    mod.exports = {"main":"underscore.js"}
});

globalModuleSystem.registerAsset("/node_modules/underscore/underscore.js",function(obtain,mod,exp,dir,file,proc){
    exp.version = '1.4.4.cloned';
    exp.noop = function() {};
});