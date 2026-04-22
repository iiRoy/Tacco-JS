const RegistrySource = require(__dirname + '/lib/registry.js');

const HiveLocation = RegistrySource.HKCU;
const StringEntryType = RegistrySource.REG_SZ;

const echoOutput = (text) => {
    process.stdout.write(text + '\n');
};

class AsyncRegistryAccessor {
    constructor(initialConfiguration) {
        this.internalRegistry = new RegistrySource(initialConfiguration);
        this.keyIdentifier = initialConfiguration.key;
    }

    get parentIdentifier() {
        return this.internalRegistry.parent.path;
    }

    async listSubkeys() {
        return new Promise((resolve, reject) => {
            this.internalRegistry.keys((issue, collection) => {
                if (issue) reject(issue);
                else resolve(collection);
            });
        });
    }

    async listAllValues() {
        return new Promise((resolve, reject) => {
            this.internalRegistry.values((issue, collection) => {
                if (issue) reject(issue);
                else resolve(collection);
            });
        });
    }

    async fetchSpecificValue(targetName) {
        return new Promise((resolve, reject) => {
            this.internalRegistry.get(targetName, (issue, detail) => {
                if (issue) reject(issue);
                else resolve(detail);
            });
        });
    }

    async writeValue(entryName, entryType, entryData) {
        return new Promise((resolve, reject) => {
            this.internalRegistry.set(entryName, entryType, entryData, (issue) => {
                if (issue) reject(issue);
                else resolve();
            });
        });
    }

    async eraseValue(entryName) {
        return new Promise((resolve, reject) => {
            this.internalRegistry.remove(entryName, (issue) => {
                if (issue) reject(issue);
                else resolve();
            });
        });
    }
}

(async () => {
    const configSet1 = { hive: HiveLocation, key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' };
    const configSet2 = { hive: HiveLocation, key: '\\Control Panel\\Desktop' };

    const regManagerA = new AsyncRegistryAccessor(configSet1);
    const regManagerB = new AsyncRegistryAccessor(configSet2);

    // Get parent key
    const parentPathB = regManagerB.parentIdentifier;
    echoOutput('parent of "'+regManagerB.keyIdentifier+'" -> "'+parentPathB+'"');

    // List subkeys
    const subkeyResults = await regManagerB.listSubkeys();
    
    if (subkeyResults) {
        for (const currentKey of subkeyResults) {
            echoOutput('subkey of "'+regManagerB.keyIdentifier+'": '+currentKey.path);
        }
    }
    
    // List values for regManagerA
    const valueResultsA = await regManagerA.listAllValues();
    
    if (valueResultsA) {
        echoOutput(JSON.stringify(valueResultsA, null, '\t'));
    }

    // Query named value from regManagerA
    if (valueResultsA && valueResultsA.length > 0) {
        const firstValueTitle = valueResultsA[0].name;
        const specificValueDetail = await regManagerA.fetchSpecificValue(firstValueTitle);
        
        if (specificValueDetail) {
            echoOutput(JSON.stringify(specificValueDetail, null, '\t'));
        }
    }

    // Add value to regManagerA
    const temporaryEntryName = 'temporary_data_item';
    await regManagerA.writeValue(temporaryEntryName, StringEntryType, 'hello from another dimension!');
    echoOutput('value written');

    // Delete value from regManagerA
    await regManagerA.eraseValue(temporaryEntryName);
    echoOutput('value deleted');

})();