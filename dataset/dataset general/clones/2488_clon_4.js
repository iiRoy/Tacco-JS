(function(global) {
    'use strict';

    // --- Internal Cookie Utility (replacement for $.cookie) ---
    // This provides basic cookie read/write functionality for fallback.
    const cookieCraft = {
        read: function(name) {
            if (typeof document === 'undefined' || !document.cookie) return null;
            const cookieMatch = document.cookie.match(new RegExp('(^|;\\s*)' + name.replace(/([.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
            return (cookieMatch && cookieMatch.length > 2) ? decodeURIComponent(cookieMatch[2]) : null;
        },
        write: function(name, value, options) {
            if (typeof document === 'undefined') return;
            options = options || {};
            let cookieLine = name + '=' + encodeURIComponent(value === null ? '' : value);

            if (options.expires) {
                let expiryDate;
                if (typeof options.expires === 'number') {
                    expiryDate = new Date();
                    expiryDate.setTime(expiryDate.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else if (options.expires.toUTCString) {
                    expiryDate = options.expires;
                }
                if (expiryDate) {
                    cookieLine += '; expires=' + expiryDate.toUTCString();
                }
            }

            if (options.path) cookieLine += '; path=' + options.path;
            if (options.domain) cookieLine += '; domain=' + options.domain;
            if (options.secure) cookieLine += '; secure';
            if (options.samesite) cookieLine += '; samesite=' + options.samesite;

            document.cookie = cookieLine;
        }
    };

    // --- Main Data Vault Logic ---
    const DataVault = {};

    const storageVariations = ['localStorage', 'sessionStorage'];

    storageVariations.forEach(function(vaultTypeIdentifier) {
        const standardSettings = {
            cookiePreamble: 'fallback:' + vaultTypeIdentifier + ':',
            cookieParameters: {
                path: '/',
                domain: (typeof document !== 'undefined' ? document.domain : ''),
                expires: (vaultTypeIdentifier === 'localStorage') ? 365 : undefined
            }
        };

        let isNativeSupported = false;
        let nativeStoreInterface = null;

        try {
            // Test native storage availability and functionality
            if (typeof global[vaultTypeIdentifier] !== 'undefined' && global[vaultTypeIdentifier] !== null) {
                const testKey = '__test__' + Math.random().toString(36).substring(2, 15);
                global[vaultTypeIdentifier].setItem(testKey, 'test');
                global[vaultTypeIdentifier].removeItem(testKey);
                isNativeSupported = true;
                nativeStoreInterface = global[vaultTypeIdentifier];
            }
        } catch (e) {
            isNativeSupported = false;
        }

        // Strategy pattern for storage operations (native vs. cookie)
        let activeStorageMechanism;
        if (isNativeSupported) {
            activeStorageMechanism = {
                fetchContent: (id) => nativeStoreInterface.getItem(id),
                storeContent: (id, val) => nativeStoreInterface.setItem(id, val),
                discardContent: (id) => nativeStoreInterface.removeItem(id),
                flushAll: () => nativeStoreInterface.clear()
            };
        } else {
            activeStorageMechanism = {
                fetchContent: (id) => cookieCraft.read(id),
                storeContent: (id, val, params) => cookieCraft.write(id, val, params),
                discardContent: (id, params) => cookieCraft.write(id, null, params),
                flushAll: (preamble, params) => {
                    if (typeof document === 'undefined' || !document.cookie) return;
                    const prefixPattern = new RegExp('^' + preamble.replace(/([.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1'));
                    const removalParameters = { ...params, expires: -1 };

                    document.cookie.split(';').forEach(cookieEntry => {
                        const trimmedCookie = cookieEntry.trim();
                        if (prefixPattern.test(trimmedCookie)) {
                            const cookieName = trimmedCookie.substring(0, trimmedCookie.indexOf('='));
                            cookieCraft.write(cookieName, null, removalParameters);
                        }
                    });
                }
            };
        }

        // Factory function to create a storage instance (e.g., DataVault.local)
        const generateVaultInstance = function() {
            // Merge global settings with instance-specific preferences
            const currentOperationalSettings = { ...standardSettings, ...DataVault[vaultTypeIdentifier].preferences };

            const coreOperations = {
                retrieveValue: function(dataKey) {
                    const obtainSingleValue = (key) => {
                        const fullKey = isNativeSupported ? key : currentOperationalSettings.cookiePreamble + key;
                        const rawData = activeStorageMechanism.fetchContent(fullKey);
                        try {
                            return rawData === null ? null : JSON.parse(rawData);
                        } catch (e) {
                            return rawData; // Return raw string if JSON parsing fails
                        }
                    };

                    if (typeof dataKey === 'string') {
                        return obtainSingleValue(dataKey);
                    }

                    if (Array.isArray(dataKey)) {
                        return dataKey.map(obtainSingleValue);
                    }

                    return null; // For invalid key types
                },

                depositValue: function(dataKey, dataContent) {
                    const stringifiedContent = JSON.stringify(dataContent);
                    const fullKey = isNativeSupported ? dataKey : currentOperationalSettings.cookiePreamble + dataKey;
                    return activeStorageMechanism.storeContent(
                        fullKey,
                        stringifiedContent,
                        currentOperationalSettings.cookieParameters
                    );
                },

                eraseValue: function(dataKey) {
                    const fullKey = isNativeSupported ? dataKey : currentOperationalSettings.cookiePreamble + dataKey;
                    return activeStorageMechanism.discardContent(
                        fullKey,
                        { ...currentOperationalSettings.cookieParameters, expires: -1 }
                    );
                },

                purgeAll: function() {
                    if (isNativeSupported) {
                        return activeStorageMechanism.flushAll();
                    } else {
                        return activeStorageMechanism.flushAll(currentOperationalSettings.cookiePreamble, currentOperationalSettings.cookieParameters);
                    }
                }
            };

            // Public method that acts as getter/setter/remover/object access point
            const publicAccessor = function(dataKey, dataContent) {
                if (typeof dataKey === 'undefined') {
                    return coreOperations; // Return the full operations object if no arguments
                }

                if (typeof dataContent !== 'undefined') {
                    // Setter or Remover
                    return dataContent === null ? coreOperations.eraseValue(dataKey) : coreOperations.depositValue(dataKey, dataContent);
                } else {
                    // Getter
                    return coreOperations.retrieveValue(dataKey);
                }
            };

            // Expose preferences for this vault type
            publicAccessor.preferences = currentOperationalSettings;

            return publicAccessor;
        };

        // Initialize the global DataVault property for this storage type
        DataVault[vaultTypeIdentifier] = generateVaultInstance();
        // Set initial preferences, allowing them to be overridden by the user
        DataVault[vaultTypeIdentifier].preferences = { ...standardSettings };
    });

    // Expose the DataVault object globally
    global.DataVault = DataVault;

}(typeof window !== 'undefined' ? window : this));