(function () {

  const globalRef = (typeof window !== 'undefined') ? window : global;
  let dataStoreHandle = null;
  let faultLog = null;
  let systemStatus = false;
  let storeIdentifier = null;
  let storeTitle = null;
  let storeCapacity = null;
  let storeRevision = null;
  let currentSystemConfig = {};

  const componentDefinitionExtractor = /(CREATE|ALTER|UPDATE)\s+(?:(?:UNIQUE\s+)?(TABLE|INDEX|TRIGGER|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?)?(?:(?:OR\s+(?:ABORT|FAIL|IGNORE|REPLACE|ROLLBACK)\s+))?(\w+)\s*(?:\((.*)\))?/i;

  const activityMonitor = (message) => {
    if (currentSystemConfig.monitoringEnabled) {
      console.log(message);
    }
  };

  const incidentReport = (transactionFault, sqlFault, customNotification) => {
    let finalNotification;
    if (transactionFault !== null && typeof sqlFault === 'undefined') {
      if (transactionFault && transactionFault.message && -1 !== transactionFault.message.indexOf('callback did not return false')) {
        return true;
      }
      finalNotification = `Transaction Failure ${transactionFault ? transactionFault.code : 'N/A'} - ${transactionFault ? transactionFault.message : 'Unknown'}`;
    } else if (sqlFault !== null) {
      finalNotification = `SQL Operation Fault ${sqlFault ? sqlFault.code : 'N/A'} - ${sqlFault ? sqlFault.message : 'Unknown'}`;
    } else {
      finalNotification = customNotification;
    }
    faultLog = finalNotification;
    console.error(`!!!!!\n! ${finalNotification}\n!!!!!`);
    return true;
  };

  const constructDataStore = (initialParameters) => {
    currentSystemConfig = {
      monitoringEnabled: false,
      schemaAsynchronous: false,
      resetOnStart: false,
      schemaPath: null,
      schemaDefinition: null,
      ...initialParameters
    };

    const instance = {
      issueRecord: null,
      isActive: false,
      longNameDescriptor: null,
      maximumSize: null,
      schemaManifest: {},
      manifestReady: false,
      shortNameDescriptor: null,
      currentVersionNumber: null,
      configuration: currentSystemConfig,
    };

    dataStoreHandle = instance;
    faultLog = instance.issueRecord;

    beginStoreInitialization();

    return instance;
  };

  const beginStoreInitialization = async () => {
    try {
      const manifest = await retrieveSchemaManifest(
        currentSystemConfig.schemaDefinition,
        currentSystemConfig.schemaPath
      );

      if (!manifest) {
        incidentReport(null, null, 'Error - Schema manifest is not available.');
        return;
      }

      const storeAccess = await obtainStoreAccess(
        manifest.shortName,
        manifest.version,
        manifest.longName,
        manifest.maxSize
      );

      if (!storeAccess) {
        dataStoreHandle.isActive = false;
        return;
      }

      dataStoreHandle.shortNameDescriptor = manifest.shortName;
      dataStoreHandle.currentVersionNumber = storeAccess.version;
      dataStoreHandle.longNameDescriptor = manifest.longName;
      dataStoreHandle.maximumSize = manifest.maxSize;
      storeIdentifier = manifest.shortName;
      storeRevision = storeAccess.version;

      activityMonitor(`DataStore ${dataStoreHandle.shortNameDescriptor} opened. Revision: ${dataStoreHandle.currentVersionNumber}, Descriptor: ${dataStoreHandle.longNameDescriptor}, Capacity: ${dataStoreHandle.maximumSize} bytes (${Math.round((dataStoreHandle.maximumSize / 10488576) * 1000) / 1000} MB)`);

      if (currentSystemConfig.resetOnStart || dataStoreHandle.currentVersionNumber === '') {
        currentSystemConfig.resetOnStart = true;
        await resetAndReconstructStore(manifest, manifest.storage);
      } else if (manifest.version > dataStoreHandle.currentVersionNumber) {
        // Upgrade logic placeholder
        // await executeManifestUpgrade(manifest, manifest.storage);
        activityMonitor('Schema upgrade logic is not yet implemented.');
        dataStoreHandle.isActive = true;
        activityMonitor(`${dataStoreHandle.shortNameDescriptor}, revision ${dataStoreHandle.currentVersionNumber}, is now active.`);
      } else {
        dataStoreHandle.isActive = true;
        activityMonitor('Same revision, no reset - store already active.');
        activityMonitor(`${dataStoreHandle.shortNameDescriptor}, revision ${dataStoreHandle.currentVersionNumber}, is now active.`);
      }
    } catch (err) {
      incidentReport(null, null, `Store initialization failed: ${err.message || err}`);
      dataStoreHandle.isActive = false;
    }
  };

  const retrieveSchemaManifest = async (schemaPayload, schemaLocation) => {
    if (schemaLocation) {
      try {
        const response = await fetch(schemaLocation, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const parsedData = await response.json();
        activityMonitor(`Schema file "${schemaLocation}" loaded.`);
        return parsedData;
      } catch (err) {
        incidentReport(null, null, `JSON Error - file "${schemaLocation}" failed to load: ${err.message}`);
        throw err;
      }
    } else if (schemaPayload) {
      return schemaPayload;
    } else {
      incidentReport(null, null, 'Error - schemaPath or schemaDefinition is not provided.');
      return null;
    }
  };

  const obtainStoreAccess = (shortIdentifier, versionNumber, longName, maxSize) => {
    return new Promise((resolve) => {
      if (!('openDatabase' in globalRef)) {
        incidentReport(null, null, 'Error - Web SQL Databases are not supported.');
        return resolve(null);
      }
      if (!shortIdentifier || !longName || !maxSize) {
        incidentReport(null, null, `Error - Store attributes incomplete: shortName: ${shortIdentifier}, longName: ${longName}, maxSize: ${maxSize}.`);
        return resolve(null);
      }
      try {
        const db = globalRef.openDatabase(shortIdentifier, '', longName, maxSize);
        resolve(db);
      } catch (err) {
        incidentReport(null, null, `Error - Store failed to open. Unknown error: ${err.message || err}.`);
        resolve(null);
      }
    });
  };

  const resetAndReconstructStore = async (manifest, localDataManifest) => {
    activityMonitor('Performing store reset and reconstruction.');

    await purgeLocalData(manifest.shortName, localDataManifest);
    await fillLocalData(manifest.shortName, localDataManifest);

    await executeStoreTransaction(dataStoreHandle.db, async (tx) => {
      const exclusionList = Object.entries(manifest)
        .filter(([key]) => key !== 'upgrades' && key !== 'storage')
        .flatMap(([key, components]) => {
          const typePrefix = key === 'indices' ? 'index' : key.slice(0, -1);
          return Object.values(components).map(comp => `"${typePrefix}${comp.name}"`);
        })
        .join(',');

      const existingComponents = await performTransactionQuery(tx,
        `SELECT upper(type) type, name FROM sqlite_master WHERE type||name Not In("table__WebKitDatabaseInfoTable__"${exclusionList ? ',' + exclusionList : ''}) AND name NOT LIKE "sqlite_%"`,
        []
      );

      await Promise.all(
        Array.from(existingComponents.rows).map(row =>
          removeStoreComponent(tx, row.type, row.name)
        )
      );
    });

    await executeStoreTransaction(dataStoreHandle.db, async (tx) => {
      const componentCategories = ['tables', 'indices', 'triggers', 'views'];
      const creationPromises = componentCategories.flatMap(categoryKey => {
        const componentDefinitions = manifest[categoryKey] || {};
        return Object.values(componentDefinitions).map(compDef => {
          const compType = categoryKey === 'indices' ? 'Index' : categoryKey.slice(0, -1);
          const compName = deriveComponentName(compDef);
          return removeStoreComponent(tx, compType, compName)
            .then(() => createStoreComponent(tx, compType, compDef));
        });
      });
      await Promise.all(creationPromises);
    });

    await updateStoreRevision(dataStoreHandle.db.version, manifest.version);

    dataStoreHandle.currentVersionNumber = dataStoreHandle.db.version;
    dataStoreHandle.isActive = true;
    activityMonitor(`${dataStoreHandle.shortNameDescriptor}, revision ${dataStoreHandle.currentVersionNumber}, is now active.`);
  };

  const purgeLocalData = (storePrefix, dataManifest) => {
    return new Promise(resolve => {
      if (dataManifest && (dataManifest.local || dataManifest.session)) {
        const storagePrefix = storePrefix.toLowerCase() + '_';
        [globalRef.localStorage, globalRef.sessionStorage].forEach(storage => {
          Object.keys(storage).forEach(key => {
            if (key.toLowerCase().startsWith(storagePrefix)) {
              delete storage[key];
              activityMonitor(`Local data entry '${key}' erased.`);
            }
          });
        });
      }
      resolve();
    });
  };

  const fillLocalData = (storePrefix, dataManifest) => {
    return new Promise(resolve => {
      if (dataManifest) {
        const storagePrefix = storePrefix.toLowerCase() + '_';
        const applyToStorage = (storageType, data) => {
          if (data) {
            Object.entries(data).forEach(([key, value]) => {
              const fullKey = storagePrefix + key;
              if (!(fullKey in storageType)) {
                storageType[fullKey] = value;
                activityMonitor(`Local data entry '${fullKey}' created with value "${value}".`);
              }
            });
          }
        };
        applyToStorage(globalRef.localStorage, dataManifest.local);
        applyToStorage(globalRef.sessionStorage, dataManifest.session);
      }
      resolve();
    });
  };

  const deriveComponentName = (componentSpec) => {
    if (componentSpec.sql) {
      const match = componentSpec.sql.replace(/\s{2,}/g, ' ').match(componentDefinitionExtractor);
      return match ? match[3] : null;
    }
    return componentSpec.name;
  };

  const removeStoreComponent = (tx, type, name) => {
    return performTransactionQuery(tx, `DROP ${type} IF EXISTS ${name};`)
      .then(() => activityMonitor(`Removed ${type} '${dataStoreHandle.shortNameDescriptor}.${name}'.`))
      .catch(err => incidentReport(null, null, `Failed to remove ${type} '${name}': ${err.message}`));
  };

  const createStoreComponent = async (tx, type, componentSpec) => {
    let statementText;
    if (componentSpec.sql) {
      statementText = componentSpec.sql;
    } else {
      const columnDefinitions = Object.entries(componentSpec.columns)
        .map(([colName, colDef]) => `${colName} ${colDef}`)
        .join(', ');
      const constraints = componentSpec.tableConstraint ? `, ${componentSpec.tableConstraint}` : '';
      statementText = `CREATE ${type} IF NOT EXISTS ${componentSpec.name} (${columnDefinitions}${constraints});`;
    }

    const actionMatch = statementText.match(componentDefinitionExtractor);
    const action = actionMatch ? actionMatch[1] : 'CREATE';

    await performTransactionQuery(tx, statementText);
    activityMonitor(`${action} ${type} '${dataStoreHandle.shortNameDescriptor}.${deriveComponentName(componentSpec)}'.`);

    if (componentSpec.records && componentSpec.records.length > 0) {
      await insertStoreRecords(tx, deriveComponentName(componentSpec), componentSpec);
    }
  };

  const insertStoreRecords = async (tx, tableName, tableSpec) => {
    const entries = tableSpec.records;
    if (!entries || entries.length === 0) return;

    await Promise.all(entries.map(entry => {
      const columns = Object.keys(entry).join(', ');
      const placeholders = Object.keys(entry).map(() => '?').join(', ');
      const values = Object.values(entry);
      return performTransactionQuery(
        tx,
        `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders});`,
        values
      );
    }));
    activityMonitor(`DataStore table '${dataStoreHandle.shortNameDescriptor}.${tableName}' populated.`);
  };

  const updateStoreRevision = (oldRev, newRev) => {
    return new Promise((resolve, reject) => {
      dataStoreHandle.db.changeVersion(
        oldRev,
        newRev,
        (tx) => { /* Transaction callback */ },
        (err) => { incidentReport(err, null, `Failed to update store revision from ${oldRev} to ${newRev}.`); reject(err); },
        () => { activityMonitor(`Store revision updated from ${oldRev} to ${newRev}.`); resolve(); }
      );
    });
  };

  const executeStoreTransaction = (db, transactionOperation) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        transactionOperation,
        (err) => { incidentReport(err, null); reject(err); },
        () => resolve()
      );
    });
  };

  const performTransactionQuery = (tx, sqlStatement, parameters = []) => {
    return new Promise((resolve, reject) => {
      tx.executeSql(
        sqlStatement,
        parameters,
        (t, result) => resolve(result),
        (t, err) => { incidentReport(t, err); reject(err); return true; }
      );
    });
  };

  const obtainManifestSnapshot = () => {
    return new Promise(async (resolve, reject) => {
      dataStoreHandle.manifestReady = false;
      const snapshotReport = {
        captureTime: new Date(),
        clientBrowser: navigator.userAgent
      };

      const localData = await collectPersistentData(globalRef.localStorage, storeIdentifier);
      const sessionData = await collectPersistentData(globalRef.sessionStorage, storeIdentifier);

      if (!localData.isEmpty || !sessionData.isEmpty) {
        snapshotReport.persistentStorage = {};
        if (!localData.isEmpty) {
          delete localData.isEmpty;
          snapshotReport.persistentStorage.local = localData;
        }
        if (!sessionData.isEmpty) {
          delete sessionData.isEmpty;
          snapshotReport.persistentStorage.session = sessionData;
        }
      }

      if ('openDatabase' in globalRef && dataStoreHandle.maximumSize !== null && dataStoreHandle.currentVersionNumber !== '') {
        snapshotReport.databaseDetails = {
          shortName: dataStoreHandle.shortNameDescriptor,
          version: dataStoreHandle.currentVersionNumber,
          longName: dataStoreHandle.longNameDescriptor,
          maxSize: dataStoreHandle.maximumSize
        };

        try {
          await executeStoreTransaction(dataStoreHandle.db, async (tx) => {
            const schemaRows = await performTransactionQuery(tx, 'SELECT sql, type, name FROM sqlite_master WHERE name!="__WebKitDatabaseInfoTable__" AND name NOT LIKE "sqlite_%" ORDER BY 1 DESC;');

            const componentRegistry = { tables: {}, indices: {}, triggers: {}, views: {} };

            await Promise.all(Array.from(schemaRows.rows).map(async (row) => {
              const fullSql = row.sql.replace(/\s{2,}/g, ' ') + ';';
              const parsed = fullSql.match(componentDefinitionExtractor);

              if (parsed && parsed[2]) {
                const typeKey = (parsed[2].toLowerCase() + 's');
                const componentName = row.name;

                const componentEntry = {
                  name: componentName,
                  sql: fullSql,
                };

                if (row.type.toLowerCase() === 'table') {
                  const tableColumns = await getTableColumnAttributes(tx, componentName);
                  componentEntry.columns = tableColumns;
                  componentEntry.records = await extractTableContents(tx, componentName);
                  componentRegistry.tables[componentName] = componentEntry;
                } else if (row.type.toLowerCase() === 'index') {
                  componentRegistry.indices[componentName] = componentEntry;
                } else if (row.type.toLowerCase() === 'trigger') {
                  componentRegistry.triggers[componentName] = componentEntry;
                } else if (row.type.toLowerCase() === 'view') {
                  componentRegistry.views[componentName] = componentEntry;
                }
              }
            }));
            Object.assign(snapshotReport.databaseDetails, componentRegistry);
          });
          dataStoreHandle.schemaManifest = snapshotReport;
          dataStoreHandle.manifestReady = true;
          resolve(snapshotReport);
        } catch (err) {
          incidentReport(null, null, `Failed to retrieve store structure: ${err.message}`);
          reject(err);
        }
      } else {
        dataStoreHandle.schemaManifest = snapshotReport;
        dataStoreHandle.manifestReady = true;
        resolve(snapshotReport);
      }
    });
  };

  const collectPersistentData = (storageReference, prefix) => {
    const collectedData = { isEmpty: true };
    const pfx = prefix.length !== 0 ? prefix.toLowerCase() + '_' : '';
    Object.keys(storageReference).forEach(key => {
      if (key.toLowerCase().startsWith(pfx)) {
        collectedData[key.substring(pfx.length)] = storageReference.getItem(key);
        collectedData.isEmpty = false;
      }
    });
    return collectedData;
  };

  const extractTableContents = async (tx, tableName) => {
    const retrievedRecords = [];
    const result = await performTransactionQuery(tx, `SELECT * FROM ${tableName} ORDER BY 1 DESC;`);
    if (result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const recordEntry = Object.keys(row).reduce((acc, key) => {
          acc[key] = row[key];
          return acc;
        }, {});
        retrievedRecords.push(recordEntry);
      }
    }
    return retrievedRecords;
  };

  const getTableColumnAttributes = async (tx, tableName) => {
    const attributes = {};
    const result = await performTransactionQuery(tx, `PRAGMA table_info(${tableName});`);
    if (result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        const colInfo = result.rows.item(i);
        let colSpec = colInfo.type;
        if (colInfo.pk) colSpec += ' PRIMARY KEY';
        if (!colInfo.notnull) colSpec += ' NULL';
        if (colInfo.dflt_value) colSpec += ` DEFAULT ${colInfo.dflt_value}`;
        attributes[colInfo.name] = colSpec.trim();
      }
    }
    return attributes;
  };

  globalRef.DataStore = constructDataStore;
  globalRef.DataStore.getSnapshot = obtainManifestSnapshot;

})();