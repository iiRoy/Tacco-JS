const confirm = {
    exactMatch: (firstValue, secondValue, message = 'Values do not match') => {
        if (firstValue !== secondValue) {
            throw new Error(`Assertion failure: ${message}. Anticipated "${secondValue}", received "${firstValue}"`);
        }
    },
    deepMatch: (firstObject, secondObject, message = 'Objects do not deeply match') => {
        if (JSON.stringify(firstObject) !== JSON.stringify(secondObject)) {
            throw new Error(`Assertion failure: ${message}. Anticipated ${JSON.stringify(secondObject)}, received ${JSON.stringify(firstObject)}`);
        }
    },
    presence: (value, message = 'Value is null or undefined') => {
        if (value === null || typeof value === 'undefined') {
            throw new Error(`Assertion failure: ${message}. Value: ${value}`);
        }
    },
    kind: (value, expectedKind, message = 'Incorrect type') => {
        if (typeof value !== expectedKind) {
            throw new Error(`Assertion failure: ${message}. Anticipated type "${expectedKind}", received "${typeof value}"`);
        }
    },
    pattern: (value, regexPattern, message = 'Value does not match pattern') => {
        if (!regexPattern.test(value)) {
            throw new Error(`Assertion failure: ${message}. Value "${value}" does not match pattern "${regexPattern}"`);
        }
    },
    isFalse: (value, message = 'Value is not false') => {
        if (value !== false) {
            throw new Error(`Assertion failure: ${message}. Anticipated false, received ${value}`);
        }
    },
    isTrue: (value, message = 'Value is not true') => {
        if (value !== true) {
            throw new Error(`Assertion failure: ${message}. Anticipated true, received ${value}`);
        }
    }
};

let scenarioCount = 0;
let successCount = 0;
let failureCount = 0;
const scenarioQueue = [];

const registerScenario = (scenarioLabel, scenarioExecutor) => {
    scenarioQueue.push({ label: scenarioLabel, executor: scenarioExecutor });
};

const initiateTestRun = async (initializationProcedure) => {
    console.log("Commencing test sequence...");
    await new Promise((resolve, reject) => {
        initializationProcedure((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
    console.log("Setup complete. Executing scenarios...");

    for (const currentScenario of scenarioQueue) {
        scenarioCount++;
        try {
            await currentScenario.executor();
            console.log(`✅ ${currentScenario.label}`);
            successCount++;
        } catch (err) {
            console.error(`❌ ${currentScenario.label}`);
            console.error(`   Failure details: ${err.message}`);
            failureCount++;
        }
    }

    console.log(`\n--- Test Execution Summary ---`);
    console.log(`Total scenarios: ${scenarioCount}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
    if (failureCount > 0) {
        process.exit(1);
    }
};

var versionOperations = require("../lib/versionmanager");

registerScenario('Dependency specification updates: Only numbers', async () => {
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("0", "1"), "1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1", "10"), "10");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("10", "1"), "1");

    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("0.1", "1.0"), "1.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0", "1.1"), "1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("2.0", "1.1"), "1.1");

    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.0", "1.0.1"), "1.0.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.1", "1.1.0"), "1.1.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("2.0.1", "2.0.11"), "2.0.11");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("2.0.0", "1.0.0"), "1.0.0");

    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.0", "1.1"), "1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.0", "2"), "2");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("22.0.1", "22"), "22");
});

registerScenario('Dependency specification updates: Wildcards included', async () => {
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.x", "1.1"), "1.x");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.x.1", "1.1.2"), "1.x.2");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.x", "1.1.1"), "1.1.x");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.x", "1.1"), "1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0.x", "2"), "2");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("2.0.x", "1.0.0"), "1.0.x");

    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("*", "1"), "*");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("*", "1.1"), "*");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("*.1", "2.0.1"), "*.0");
});

registerScenario('Dependency specification updates: With constraints', async () => {
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("<1.0", "1.1"), "<1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("<1.0", "1.1.1"), "<1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration(">=1.0", "2.0"), ">=2.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration(">= 1.0", "2.0"), ">= 2.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("^1.2.3", "1.2.4"), "^1.2.4");
});

registerScenario('Dependency specification updates: Mixed constraints and ranges', async () => {
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("^1.0.0 < 1.2.0", "3.1.0"), "^3.1.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("~1.0 < 1.2.0", "3.1.0"), "~3.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.x < 1.2.0", "3.1.0"), "3.x");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.2.0 < 1.x", "3.1.0"), "3.x");
});

registerScenario('Dependency specification updates: Preserving non-standard prefixes', async () => {
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("v1.0", "1.1"), "v1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("=v1.0", "1.1"), "=v1.1");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration(" =v1.0", "1.1"), " =v1.1");
});

registerScenario('Dependency specification updates: Maintaining existing on unknown new version', async () => {
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0", ""), "1.0");
    confirm.exactMatch(versionOperations.upgradeDependencyDeclaration("1.0", null), "1.0");
});

registerScenario('Multiple dependency upgrades: Basic object transformation', async () => {
    confirm.deepMatch(versionOperations.upgradeDependencies({ mongodb: '^1.4.29' }, { mongodb: '1.4.30' }), { mongodb: '^1.4.30' });
});

registerScenario('Multiple dependency upgrades: Preventing downgrades', async () => {
    confirm.deepMatch(versionOperations.upgradeDependencies({ mongodb: '^2.0.7' }, { mongodb: '1.4.30' }), {});
});

registerScenario('Package information retrieval: Latest version for a valid package', async () => {
    const obtainedVersion = await new Promise((resolve, reject) => {
        versionOperations.getLatestPackageVersion("async", (err, version) => {
            if (err) return reject(err);
            resolve(version);
        });
    });
    confirm.presence(obtainedVersion);
    confirm.kind(obtainedVersion, 'string');
});

registerScenario('Package information retrieval: Greatest version for a valid package', async () => {
    const obtainedVersion = await new Promise((resolve, reject) => {
        versionOperations.getGreatestPackageVersion("async", (err, version) => {
            if (err) return reject(err);
            resolve(version);
        });
    });
    confirm.presence(obtainedVersion);
    confirm.kind(obtainedVersion, 'string');
});

registerScenario('Multiple package information retrieval: Single package', async () => {
    const outcome = await new Promise((resolve, reject) => {
        versionOperations.getLatestVersions(["async"], (err, latestVersions) => {
            if (err) return reject(err);
            resolve(latestVersions);
        });
    });
    confirm.presence(outcome.async);
});

registerScenario('Multiple package information retrieval: Several packages', async () => {
    const outcome = await new Promise((resolve, reject) => {
        versionOperations.getLatestVersions(["async", "npm"], (err, latestVersions) => {
            if (err) return reject(err);
            resolve(latestVersions);
        });
    });
    confirm.presence(outcome.async);
    confirm.presence(outcome.npm);
});

registerScenario('Multiple package information retrieval: Non-existent packages handled gracefully', async () => {
    await new Promise((resolve, reject) => {
        versionOperations.getLatestVersions(["sudoMakeMeASandwitch"], (err, latestVersions) => {
            if (err) return reject(err);
            resolve(latestVersions);
        });
    });
    // No specific assertion on result, just ensure no error
});

registerScenario('Multiple package information retrieval: With an empty options object', async () => {
    const outcome = await new Promise((resolve, reject) => {
        versionOperations.getLatestVersions(["async"], {}, (err, latestVersions) => {
            if (err) return reject(err);
            resolve(latestVersions);
        });
    });
    confirm.presence(outcome.async);
});

registerScenario('Multiple package information retrieval: Explicitly targeting latest version', async () => {
    const outcome = await new Promise((resolve, reject) => {
        versionOperations.getLatestVersions(["async"], { versionTarget: 'latest' }, (err, latestVersions) => {
            if (err) return reject(err);
            resolve(latestVersions);
        });
    });
    confirm.presence(outcome.async);
});

registerScenario('Multiple package information retrieval: Explicitly targeting greatest version', async () => {
    const outcome = await new Promise((resolve, reject) => {
        versionOperations.getLatestVersions(["async"], { versionTarget: 'greatest' }, (err, latestVersions) => {
            if (err) return reject(err);
            resolve(latestVersions);
        });
    });
    confirm.presence(outcome.async);
});

registerScenario('Multiple package information retrieval: Unsupported version target yields an error', async () => {
    let capturedError = null;
    try {
        await new Promise((resolve, reject) => {
            versionOperations.getLatestVersions(["async"], { versionTarget: 'foo' }, (err, latestVersions) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(latestVersions);
                }
            });
        });
    } catch (err) {
        capturedError = err;
    }
    confirm.presence(capturedError);
    confirm.pattern(capturedError.message, /unsupported/i);
});

registerScenario('Upgrade eligibility check: Upgrade when current version does not satisfy latest', async () => {
    confirm.isTrue(versionOperations.isUpgradeable("0.1.x", "0.5.1"));
});

registerScenario('Upgrade eligibility check: Do not upgrade invalid versions', async () => {
    confirm.isFalse(versionOperations.isUpgradeable("https://github.com/strongloop/express", "4.11.2"));
});

registerScenario('Upgrade eligibility check: Do not upgrade past the latest version', async () => {
    confirm.isFalse(versionOperations.isUpgradeable("5.0.0", "4.11.2"));
});

initiateTestRun((callback) => versionOperations.initialize(false, callback));