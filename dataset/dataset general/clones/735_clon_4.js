/*
All this code is copyright Orteil, 2013.
	-with some help, advice and fixes by Debugbro and Opti
Spoilers ahead.
http://orteil.dashnet.org
*/

//seeded random function, courtesy of http://davidbau.com/archives/2010/01/30/random_seeds_coded_hints_and_quintillions.html
(function(a,b,c,d,e,f){function k(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=j&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=j&f+1],c=c*d+h[j&(h[f]=h[g=j&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function l(a,b){var e,c=[],d=(typeof a)[0];if(b&&"o"==d)for(e in a)try{c.push(l(a[e],b-1))}catch(f){}return c.length?c:"s"==d?a:a+"\0"}function m(a,b){for(var d,c=a+"",e=0;c.length>e;)b[j&e]=j&(d^=19*b[j&e])+c.charCodeAt(e++);return o(b)}function n(c){try{return a.crypto.getRandomValues(c=new Uint8Array(d)),o(c)}catch(e){return[+new Date,a,a.navigator.plugins,a.screen,o(b)]}}function o(a){return String.fromCharCode.apply(0,a)}var g=c.pow(d,e),h=c.pow(2,f),i=2*h,j=d-1;c.seedrandom=function(a,f){var j=[],p=m(l(f?[a,o(b)]:0 in arguments?a:n(),3),j),q=new k(j);return m(o(q.S),b),c.random=function(){for(var a=q.g(e),b=g,c=0;h>a;)a=(a+c)*d,b*=d,c=q.g(1);for(;a>=i;)a/=2,b/=2,c>>>=1;return(a+c)/b},p},m(c.random(),b)})(this,[],Math,256,6,52);

class PersistentStateEngine {
    #engineData;
    #momentOfOrigin;
    #targetFrameRate;
    #releaseVersion;
    #preReleaseStatus;
    #domRegistry;

    constructor() {
        this.#engineData = {};
        this.#momentOfOrigin = 0;
        this.#targetFrameRate = 30;
        this.#releaseVersion = 1.036;
        this.#preReleaseStatus = false;

        this.#domRegistry = new Map();
        this.#domRegistry.set('interfaceErrorDisplay', 'javascriptError');
        this.#domRegistry.set('versionInfo', 'versionNumber');
        this.#domRegistry.set('externalSiteLinks', 'links');
        this.#domRegistry.set('systemAlertArea', 'alert');

        this.#initializeSystemDefaults();
    }

    #retrieveDomElement(identifierKey) {
        const domId = this.#domRegistry.get(identifierKey);
        return domId ? document.getElementById(domId) : null;
    }

    #formatNumericDisplay(valueInput, decimalPrecision = 0) {
        let numericalValue = Number(valueInput);
        if (isNaN(numericalValue)) return 'Invalid Number';

        numericalValue = Math.round(numericalValue * 100000) / 100000;

        let integerComponent = Math.floor(numericalValue);
        let formattedIntegerComponent = '';

        if (integerComponent === 0) {
            formattedIntegerComponent = '0';
        } else {
            let tempSegment = '';
            let digitCounter = 0;
            let currentInt = integerComponent;
            while (currentInt > 0) {
                tempSegment = (currentInt % 10) + tempSegment;
                currentInt = Math.floor(currentInt / 10);
                digitCounter++;
                if (digitCounter % 3 === 0 && currentInt > 0) {
                    tempSegment = ',' + tempSegment;
                }
            }
            formattedIntegerComponent = tempSegment;
        }

        if (decimalPrecision > 0) {
            const fractionalComponent = numericalValue - integerComponent;
            const hasActualFraction = fractionalComponent !== 0;

            let stringifiedFraction = '';
            if (hasActualFraction) {
                let tempFloatStr = (Math.round(fractionalComponent * 100000) / 100000).toString();
                const decimalPointIndex = tempFloatStr.indexOf('.');
                if (decimalPointIndex !== -1) {
                    stringifiedFraction = tempFloatStr.slice(decimalPointIndex + 1);
                }
                stringifiedFraction = (stringifiedFraction + '0000000').slice(0, decimalPrecision);
            } else {
                stringifiedFraction = '0'.repeat(decimalPrecision);
            }

            if (hasActualFraction || decimalPrecision > 0) {
                if (stringifiedFraction.length > 0) {
                    return `${formattedIntegerComponent}.${stringifiedFraction}`;
                } else {
                    return formattedIntegerComponent;
                }
            } else {
                return formattedIntegerComponent;
            }
        } else {
            return formattedIntegerComponent;
        }
    }

    #obtainRandomItem(collectionSource) {
        if (!Array.isArray(collectionSource) || collectionSource.length === 0) return undefined;
        const randomIndex = Math.floor(Math.random() * collectionSource.length);
        return collectionSource[randomIndex];
    }

    #reorderCollection(sourceArray) {
        const workingCopy = [...sourceArray];
        let remainingElements = workingCopy.length;
        let temporaryStorage, selectionIndex;

        while (remainingElements > 0) {
            selectionIndex = Math.floor(Math.random() * remainingElements);
            remainingElements--;

            temporaryStorage = workingCopy[remainingElements];
            workingCopy[remainingElements] = workingCopy[selectionIndex];
            workingCopy[selectionIndex] = temporaryStorage;
        }
        return workingCopy;
    }

    #encodeStringToBase64(plainText) {
        try {
            return btoa(encodeURIComponent(plainText).replace(/%([0-9A-F]{2})/g,
                function(match, hexValue) {
                    return String.fromCharCode('0x' + hexValue);
                }));
        } catch (e) {
            console.error('Encoding failure:', e);
            return '';
        }
    }

    #decodeBase64ToString(encodedText) {
        try {
            return decodeURIComponent(atob(encodedText).split('').map(function(char) {
                return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) {
            console.error('Decoding failure:', e);
            return '';
        }
    }

    #compressBinarySequence(booleanFlags) {
        let currentAggregate = 0n;
        for (let i = 0; i < booleanFlags.length; i++) {
            if (booleanFlags[i]) {
                currentAggregate |= (1n << BigInt(i));
            }
        }
        return currentAggregate.toString(36);
    }

    #decompressBinarySequence(compressedString, expectedSize) {
        const recoveredFlags = new Array(expectedSize).fill(0);
        if (!compressedString) return recoveredFlags;

        try {
            let aggregateValue = BigInt(parseInt(compressedString, 36));
            for (let i = 0; i < expectedSize; i++) {
                if ((aggregateValue & (1n << BigInt(i))) !== 0n) {
                    recoveredFlags[i] = 1;
                }
            }
        } catch (e) {
            console.warn('Failed to decompress binary flags:', e);
        }
        return recoveredFlags;
    }

    #initializeSystemDefaults() {
        this.#engineData = {
            systemReady: 0,
            animationTicks: 0,
            systemVersion: this.#releaseVersion,
            isBeta: this.#preReleaseStatus,
            lastTickTime: new Date().getTime(),
            frameRateMonitor: new Date().getTime(),
            latencyCompensation: 0,
            catchupOperations: 0,
            totalGeneratedCookies: 0,
            currentCookieStock: 0,
            displayedCookieStock: 0,
            cookieRatePerSecond: 1,
            cookiesLostOnReset: 0,
            frenzyEffectActive: 0,
            frenzyEffectMagnitude: 1,
            clickBonusActive: 0,
            cookieClickCount: 0,
            goldenClickCount: 0,
            goldenClickMissCount: 0,
            manualCookieClicks: 0,
            milkVisualLevel: 0,
            displayedMilkLevel: 0,
            customMilkVariant: -1,
            customBackgroundVariant: -1,
            persistedAchievements: [],
            grandElderInfluence: 0,
            grandElderDisplay: 0,
            covenantPledges: 0,
            pledgeTimerRemaining: 0,
            activeResearchId: 0,
            researchCountdown: 0,
            currentBackgroundGraphic: '',
            backgroundFadeGraphic: '',
            backgroundFadeProgress: 0,
            displayedBackgroundFadeProgress: 0,
            initialLaunchTime: parseInt(new Date().getTime()),
            configuration: {
                particleEffectsEnabled: 1,
                numberAnimationsEnabled: 1,
                automaticSaveEnabled: 1,
                automaticUpdateCheck: 1,
                milkDisplayEnabled: 1,
                advancedVisuals: 1,
            },
            buildingCollection: [
                { id: 'BuildingA', quantity: 0, purchasedCount: 0, totalOutput: 0, specialStatus: 0, buyHandler: null, refreshHandler: null },
                { id: 'BuildingB', quantity: 0, purchasedCount: 0, totalOutput: 0, specialStatus: 0, buyHandler: null, refreshHandler: null },
            ],
            enhancementCollection: [
                { id: 'UpgradeX', obtained: false, unlocked: false },
                { id: 'UpgradeY', obtained: false, unlocked: false },
            ],
            trophyCollection: [
                { id: 'Trophy1', achieved: false },
                { id: 'Trophy2', achieved: false },
            ],
        };
    }

    systemActivationSequence() {
        this.#engineData.systemReady = 0;
        const errorDisplay = this.#retrieveDomElement('interfaceErrorDisplay');
        if (errorDisplay) {
            errorDisplay.innerHTML = '<div style="padding:64px 128px;"><div class="title">Initializing Core Systems...</div></div>';
        }

        this.#engineData.systemReady = 1;

        const versionElement = this.#retrieveDomElement('versionInfo');
        if (versionElement) {
            versionElement.innerHTML = `Ver. ${this.#engineData.systemVersion}${(this.#engineData.isBeta ? ' <span style="color:#ff0;">pre-release</span>' : '')}`;
        }

        const linkElement = this.#retrieveDomElement('externalSiteLinks');
        if (linkElement) {
            linkElement.innerHTML = '<a href="http://orteil.dashnet.org/experiments/cookie/" target="blank">Classic Cookie Clicker</a>';
        }

        this.#applyVisualsSetting(this.#engineData.configuration.advancedVisuals);
    }

    #applyVisualsSetting(enableVisuals) {
        if (enableVisuals) {
            document.body.classList.remove('noFancy');
        } else {
            document.body.classList.add('noFancy');
        }
    }

    saveCurrentSystemState(isForExport = false) {
        const dataAssembler = [];

        dataAssembler.push(this.#engineData.systemVersion);
        dataAssembler.push('');

        dataAssembler.push([
            this.#engineData.initialLaunchTime,
            this.#engineData.currentCookieStock,
            this.#engineData.totalGeneratedCookies,
            this.#engineData.cookieClickCount,
            this.#engineData.goldenClickCount,
            this.#engineData.manualCookieClicks,
            this.#engineData.goldenClickMissCount,
            this.#engineData.customBackgroundVariant,
            this.#engineData.customMilkVariant,
            this.#engineData.cookiesLostOnReset,
            this.#engineData.grandElderInfluence,
            this.#engineData.covenantPledges,
            this.#engineData.pledgeTimerRemaining,
            this.#engineData.activeResearchId,
            this.#engineData.researchCountdown
        ].map(val => Math.floor(Number(val))).join(';'));

        dataAssembler.push([
            this.#engineData.configuration.particleEffectsEnabled,
            this.#engineData.configuration.numberAnimationsEnabled,
            this.#engineData.configuration.automaticSaveEnabled,
            this.#engineData.configuration.automaticUpdateCheck,
            this.#engineData.configuration.milkDisplayEnabled,
            this.#engineData.configuration.advancedVisuals
        ].join(''));

        dataAssembler.push(this.#engineData.buildingCollection.map(item =>
            [item.quantity, item.purchasedCount, Math.floor(item.totalOutput), item.specialStatus].join(',')
        ).join(';'));

        const enhancementFlags = [];
        this.#engineData.enhancementCollection.forEach(enh => {
            enhancementFlags.push(enh.unlocked ? 1 : 0);
            enhancementFlags.push(enh.obtained ? 1 : 0);
        });
        dataAssembler.push(this.#compressBinarySequence(enhancementFlags));

        const trophyFlags = this.#engineData.trophyCollection.map(trophy => (trophy.achieved ? 1 : 0));
        dataAssembler.push(this.#compressBinarySequence(trophyFlags));

        let finalEncodedData = dataAssembler.join('|');

        if (isForExport) {
            return escape(this.#encodeStringToBase64(finalEncodedData) + '!END!');
        } else {
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 5);
            const cookieContent = this.#encodeStringToBase64(finalEncodedData) + '!END!';
            document.cookie = `GameplayDataStore=${escape(cookieContent)}; expires=${expiryDate.toUTCString()}; path=/`;

            if (document.cookie.indexOf('GameplayDataStore') < 0) {
                console.warn('System failed to persist data to cookie. Consider manual export.');
            } else {
                console.info('System state successfully saved.');
            }
        }
    }

    loadPreviousSystemState(incomingData = null) {
        let rawStoredData = '';
        if (incomingData) {
            rawStoredData = unescape(incomingData);
        } else if (document.cookie.indexOf('GameplayDataStore') >= 0) {
            const cookieMatch = document.cookie.split('GameplayDataStore=')[1];
            rawStoredData = unescape(cookieMatch.split(';')[0]);
        }

        if (rawStoredData === '') return;

        const cleanData = rawStoredData.split('!END!')[0];
        const decodedContent = this.#decodeBase64ToString(cleanData);

        if (decodedContent === '') {
            console.error('Failed to interpret stored data.');
            return;
        }

        const parsedSegments = decodedContent.split('|');
        const loadedSystemVersion = parseFloat(parsedSegments[0]);

        if (loadedSystemVersion > this.#engineData.systemVersion) {
            alert(`Error: Cannot load data from a newer version (v.${loadedSystemVersion}; current is v.${this.#engineData.systemVersion}).`);
            return;
        }

        const coreStats = parsedSegments[2].split(';');
        this.#engineData.initialLaunchTime = parseInt(coreStats[0]);
        this.#engineData.currentCookieStock = parseFloat(coreStats[1]);
        this.#engineData.totalGeneratedCookies = parseFloat(coreStats[2]);
        this.#engineData.cookieClickCount = parseInt(coreStats[3]);
        this.#engineData.goldenClickCount = parseInt(coreStats[4]);
        this.#engineData.manualCookieClicks = parseFloat(coreStats[5]);
        this.#engineData.goldenClickMissCount = parseInt(coreStats[6]);
        this.#engineData.customBackgroundVariant = parseInt(coreStats[7]);
        this.#engineData.customMilkVariant = parseInt(coreStats[8]);
        this.#engineData.cookiesLostOnReset = parseFloat(coreStats[9]);
        this.#engineData.grandElderInfluence = parseInt(coreStats[10]);
        this.#engineData.covenantPledges = parseInt(coreStats[11]);
        this.#engineData.pledgeTimerRemaining = parseInt(coreStats[12]);
        this.#engineData.activeResearchId = parseInt(coreStats[13]);
        this.#engineData.researchCountdown = parseInt(coreStats[14]);

        const configDigits = parsedSegments[3].split('').map(Number);
        this.#engineData.configuration.particleEffectsEnabled = configDigits[0];
        this.#engineData.configuration.numberAnimationsEnabled = configDigits[1];
        this.#engineData.configuration.automaticSaveEnabled = configDigits[2];
        this.#engineData.configuration.automaticUpdateCheck = configDigits[3] !== undefined ? configDigits[3] : 1;
        this.#engineData.configuration.milkDisplayEnabled = configDigits[4] !== undefined ? configDigits[4] : 1;
        this.#engineData.configuration.advancedVisuals = configDigits[5] !== undefined ? configDigits[5] : 1;
        this.#applyVisualsSetting(this.#engineData.configuration.advancedVisuals);

        const buildingRecords = parsedSegments[4].split(';');
        this.#engineData.buildingCollection.forEach((item, index) => {
            if (buildingRecords[index]) {
                const parts = buildingRecords[index].split(',');
                item.quantity = parseInt(parts[0]);
                item.purchasedCount = parseInt(parts[1]);
                item.totalOutput = parseInt(parts[2]);
                item.specialStatus = parseInt(parts[3]);
            } else {
                item.quantity = 0; item.purchasedCount = 0; item.totalOutput = 0; item.specialStatus = 0;
            }
        });

        const compressedEnhancements = parsedSegments[5];
        const enhancementFlags = this.#decompressBinarySequence(compressedEnhancements, this.#engineData.enhancementCollection.length * 2);
        this.#engineData.enhancementCollection.forEach((item, index) => {
            const unlockedFlag = enhancementFlags[index * 2];
            const obtainedFlag = enhancementFlags[index * 2 + 1];
            item.unlocked = unlockedFlag === 1;
            item.obtained = obtainedFlag === 1;
        });

        const compressedTrophies = parsedSegments[6];
        const trophyFlags = this.#decompressBinarySequence(compressedTrophies, this.#engineData.trophyCollection.length);
        this.#engineData.trophyCollection.forEach((item, index) => {
            const achievedFlag = trophyFlags[index];
            item.achieved = achievedFlag === 1;
        });

        this.#engineData.buildingCollection.forEach(item => {
            if (item.buyHandler) item.buyHandler();
            if (item.refreshHandler) item.refreshHandler();
        });
    }

    commenceExecution() {
        this.systemActivationSequence();
    }

    initiateDataExport() {
        const exportedContent = this.saveCurrentSystemState(true);
        prompt('Duplicate this textual data for safekeeping!', exportedContent);
    }

    executeDataImport() {
        const importedContent = prompt('Please input the previously exported data string.', '');
        if (importedContent && importedContent !== '') {
            this.loadPreviousSystemState(importedContent);
            this.saveCurrentSystemState();
        }
    }

    requestSystemUpdateCheck() {
        console.log('Initiating system update verification...');
    }

    processUpdateResponse(serverResponse) {
        const parts = serverResponse.split('|');
        const latestAvailableVersion = parseFloat(parts[0]);
        if (latestAvailableVersion > this.#engineData.systemVersion) {
            const alertMessage = `<b>New system revision available: v.${latestAvailableVersion}!</b>` +
                                  (parts[1] ? `<br>Release notes: "${parts[1]}"` : '') +
                                  '<br><b>Reload page to apply update!</b>';
            const alertDisplay = this.#retrieveDomElement('systemAlertArea');
            if (alertDisplay) {
                alertDisplay.innerHTML = alertMessage;
                alertDisplay.style.display = 'block';
            }
        }
    }
}

let currentSystemInstance = null;

function activateGameEngine() {
    currentSystemInstance = new PersistentStateEngine();
    currentSystemInstance.commenceExecution();
}