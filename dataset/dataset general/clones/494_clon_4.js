const assertTruth = {
    _fail(message) {
        throw new Error(`AssertionFailure: ${message}`);
    },

    isEqual(actual, expected, description = 'Values should be equal') {
        if (actual !== expected) {
            this._fail(`${description}: Expected "${expected}", but got "${actual}"`);
        }
    },

    isObject(value, description = 'Value must be an object') {
        if (typeof value !== 'object' || value === null) {
            this._fail(`${description}: Expected an object, but got "${typeof value}"`);
        }
    },

    isInstanceOf(value, constructor, description = 'Value must be an instance of constructor') {
        if (!(value instanceof constructor)) {
            this._fail(`${description}: Expected instance of ${constructor.name}, but got ${value.constructor.name}`);
        }
    },

    isArray(value, description = 'Value must be an array') {
        if (!Array.isArray(value)) {
            this._fail(`${description}: Expected an array, but got "${typeof value}"`);
        }
    },

    arrayHasLength(arr, expectedLength, description = 'Array length mismatch') {
        this.isArray(arr, description);
        if (arr.length !== expectedLength) {
            this._fail(`${description}: Expected array length ${expectedLength}, but got ${arr.length}`);
        }
    },

    exists(value, description = 'Value should exist') {
        if (value === null || typeof value === 'undefined') {
            this._fail(`${description}: Value does not exist.`);
        }
    },

    doesNotExist(value, description = 'Value should not exist') {
        if (!(value === null || typeof value === 'undefined')) {
            this._fail(`${description}: Value unexpectedly exists.`);
        }
    },

    async throwsInstanceOf(asyncFn, ErrorType, description = 'Function should throw specific error instance') {
        let caughtError = null;
        try {
            await asyncFn();
        } catch (e) {
            caughtError = e;
        }
        if (!caughtError) {
            this._fail(`${description}: Function did not throw any error.`);
        }
        if (!(caughtError instanceof ErrorType)) {
            this._fail(`${description}: Expected error of type ${ErrorType.name}, but got ${caughtError.constructor.name}.`);
        }
    }
};

const AccountEntity = require('../../models/user');

function validateProfileData(subjectData, referenceData = null) {
    assertTruth.isObject(subjectData, 'Subject data must be an object');
    assertTruth.isInstanceOf(subjectData, AccountEntity, 'Subject data must be an AccountEntity instance');

    if (referenceData) {
        ['id', 'name'].forEach(prop => {
            assertTruth.isEqual(subjectData[prop], referenceData[prop], `Property "${prop}" should match for profile`);
        });
    }
}

function confirmRosterInclusion(rosterCollection, targetProfile) {
    assertTruth.isArray(rosterCollection, 'Roster collection must be an array');
    let foundCount = 0;
    rosterCollection.forEach(rosterMember => {
        if (rosterMember.id === targetProfile.id) {
            foundCount++;
            validateProfileData(rosterMember, targetProfile);
        }
    });
    assertTruth.isEqual(foundCount, 1, `Roster should contain profile with ID ${targetProfile.id} exactly once`);
}

function confirmRosterExclusion(rosterCollection, targetProfile) {
    assertTruth.isArray(rosterCollection, 'Roster collection must be an array');
    const rosterContainsTarget = rosterCollection.some(rosterMember => rosterMember.id === targetProfile.id);
    assertTruth.isEqual(rosterContainsTarget, false, `Roster should NOT contain profile with ID ${targetProfile.id}`);
}

async function checkSocialConnections(accountSubject, expectedFollowingSet, expectedOtherSet) {
    const { following: actualFollowing, others: actualOthers } = await new Promise((resolve, reject) => {
        accountSubject.getFollowingAndOthers((err, f, o) => {
            if (err) return reject(err);
            resolve({ following: f, others: o });
        });
    });

    assertTruth.isArray(actualFollowing, 'Actual following list must be an array');
    assertTruth.arrayHasLength(actualFollowing, expectedFollowingSet.length, 'Following list length mismatch');
    expectedFollowingSet.forEach(expFollowedProfile => {
        confirmRosterInclusion(actualFollowing, expFollowedProfile);
    });
    expectedOtherSet.forEach(expOtherProfile => {
        confirmRosterExclusion(actualFollowing, expOtherProfile);
    });

    assertTruth.isArray(actualOthers, 'Actual others list must be an array');
    expectedOtherSet.forEach(expOtherProfile => {
        confirmRosterInclusion(actualOthers, expOtherProfile);
    });
    expectedFollowingSet.forEach(expFollowedProfile => {
        confirmRosterExclusion(actualOthers, expFollowedProfile);
    });

    confirmRosterExclusion(actualFollowing, accountSubject);
    confirmRosterExclusion(actualOthers, accountSubject);

    return { actualFollowing, actualOthers };
}

async function performComprehensiveAccountValidation() {
    let initialAccountRecords;
    let alphaAccount, betaAccount, gammaAccount, deltaAccount;

    console.log('Initiating comprehensive account validation...');

    try {
        console.log('Sequence 1: Listing baseline accounts...');
        initialAccountRecords = await new Promise((resolve, reject) => {
            AccountEntity.getAll((err, accounts) => err ? reject(err) : resolve(accounts));
        });
        assertTruth.isArray(initialAccountRecords, 'Baseline accounts must be an array');
        initialAccountRecords.forEach(account => validateProfileData(account));

        console.log('Sequence 2: Provisioning Alpha account...');
        const alphaName = 'Subject Alpha Designation';
        alphaAccount = await new Promise((resolve, reject) => {
            AccountEntity.create({ name: alphaName }, (err, account) => err ? reject(err) : resolve(account));
        });
        validateProfileData(alphaAccount);
        assertTruth.exists(alphaAccount.id, 'Alpha account identifier must exist');
        assertTruth.isEqual(alphaAccount.name, alphaName, 'Alpha account designation must correspond');

        console.log('Sequence 3: Retrieving Alpha account...');
        const retrievedAlpha = await new Promise((resolve, reject) => {
            AccountEntity.get(alphaAccount.id, (err, account) => err ? reject(err) : resolve(account));
        });
        validateProfileData(retrievedAlpha, alphaAccount);

        console.log('Sequence 4: Re-listing accounts post-Alpha creation...');
        const accountsAfterAlpha = await new Promise((resolve, reject) => {
            AccountEntity.getAll((err, accounts) => err ? reject(err) : resolve(accounts));
        });
        assertTruth.arrayHasLength(accountsAfterAlpha, initialAccountRecords.length + 1, 'Account roster should be incremented by one');
        confirmRosterInclusion(accountsAfterAlpha, alphaAccount);

        console.log('Sequence 5: Modifying Alpha account designation...');
        alphaAccount.name += ' (revised)';
        await new Promise((resolve, reject) => alphaAccount.save(err => err ? reject(err) : resolve()));

        console.log('Sequence 6: Retrieving revised Alpha account...');
        const updatedAlpha = await new Promise((resolve, reject) => {
            AccountEntity.get(alphaAccount.id, (err, account) => err ? reject(err) : resolve(account));
        });
        validateProfileData(updatedAlpha, alphaAccount);

        console.log('Sequence 7: Eradicating Alpha account...');
        await new Promise((resolve, reject) => alphaAccount.del(err => err ? reject(err) : resolve()));

        console.log('Sequence 8: Attempting retrieval of eradicated Alpha account...');
        await assertTruth.throwsInstanceOf(async () => {
            await new Promise((resolve, reject) => {
                AccountEntity.get(alphaAccount.id, (err, account) => {
                    if (err) return reject(err);
                    resolve(account);
                });
            });
        }, Error, 'Retrieval of eradicated account should result in an Error');

        console.log('Sequence 9: Re-listing accounts post-Alpha eradication...');
        const accountsAfterEradication = await new Promise((resolve, reject) => {
            AccountEntity.getAll((err, accounts) => err ? reject(err) : resolve(accounts));
        });
        assertTruth.arrayHasLength(accountsAfterEradication, initialAccountRecords.length, 'Account roster should revert to baseline length');
        confirmRosterExclusion(accountsAfterEradication, alphaAccount);

        console.log('Sequence 10: Provisioning Beta and Gamma accounts in parallel...');
        [betaAccount, gammaAccount] = await Promise.all([
            new Promise((resolve, reject) => AccountEntity.create({ name: 'Subject Beta Designation' }, (err, acc) => err ? reject(err) : resolve(acc))),
            new Promise((resolve, reject) => AccountEntity.create({ name: 'Subject Gamma Designation' }, (err, acc) => err ? reject(err) : resolve(acc)))
        ]);
        validateProfileData(betaAccount);
        validateProfileData(gammaAccount);

        console.log('Sequence 11: Verifying Beta account social graph (initial state)...');
        const { others: betaOthersInitial } = await checkSocialConnections(betaAccount, [], [gammaAccount]);
        assertTruth.arrayHasLength(betaOthersInitial, initialAccountRecords.length + 1, 'Beta others list length must correspond');

        console.log('Sequence 12: Verifying Gamma account social graph (initial state)...');
        const { others: gammaOthersInitial } = await checkSocialConnections(gammaAccount, [], [betaAccount]);
        assertTruth.arrayHasLength(gammaOthersInitial, initialAccountRecords.length + 1, 'Gamma others list length must correspond');

        console.log('Sequence 13: Beta account establishing connection with Gamma...');
        await new Promise((resolve, reject) => betaAccount.follow(gammaAccount, err => err ? reject(err) : resolve()));

        console.log('Sequence 14: Beta account re-establishing connection with Gamma (idempotency check)...');
        await new Promise((resolve, reject) => betaAccount.follow(gammaAccount, err => err ? reject(err) : resolve()));

        console.log('Sequence 15: Verifying Beta account social graph (post-connection)...');
        await checkSocialConnections(betaAccount, [gammaAccount], []);

        console.log('Sequence 16: Verifying Gamma account social graph (post-Beta connection)...');
        await checkSocialConnections(gammaAccount, [], [betaAccount]);

        console.log('Sequence 17: Beta account severing connection with Gamma...');
        await new Promise((resolve, reject) => betaAccount.unfollow(gammaAccount, err => err ? reject(err) : resolve()));

        console.log('Sequence 18: Beta account re-severing connection with Gamma (idempotency check)...');
        await new Promise((resolve, reject) => betaAccount.unfollow(gammaAccount, err => err ? reject(err) : resolve()));

        console.log('Sequence 19: Verifying Beta account social graph (post-severance)...');
        await checkSocialConnections(betaAccount, [], [gammaAccount]);

        console.log('Sequence 20: Verifying Gamma account social graph (post-Beta severance)...');
        await checkSocialConnections(gammaAccount, [], [betaAccount]);

        console.log('Sequence 21: Provisioning Delta account...');
        const deltaName = 'Subject Delta Designation';
        deltaAccount = await new Promise((resolve, reject) => {
            AccountEntity.create({ name: deltaName }, (err, account) => err ? reject(err) : resolve(account));
        });
        validateProfileData(deltaAccount);
        assertTruth.isEqual(deltaAccount.name, deltaName, 'Delta account designation must correspond');

        console.log('Sequence 22: Beta linking Gamma, Gamma linking Delta concurrently...');
        await Promise.all([
            new Promise((resolve, reject) => betaAccount.follow(gammaAccount, err => err ? reject(err) : resolve())),
            new Promise((resolve, reject) => gammaAccount.follow(deltaAccount, err => err ? reject(err) : resolve()))
        ]);

        console.log('Sequence 23: Verifying all account social graphs...');
        await Promise.all([
            checkSocialConnections(betaAccount, [gammaAccount], [deltaAccount]),
            checkSocialConnections(gammaAccount, [deltaAccount], [betaAccount]),
            checkSocialConnections(deltaAccount, [], [betaAccount, gammaAccount])
        ]);

        console.log('Sequence 24: Eradicating Beta account...');
        await new Promise((resolve, reject) => betaAccount.del(err => err ? reject(err) : resolve()));

        console.log('Sequence 25: Verifying Gamma and Delta social graphs post-Beta eradication...');
        await Promise.all([
            checkSocialConnections(gammaAccount, [deltaAccount], []),
            checkSocialConnections(deltaAccount, [], [gammaAccount])
        ]);

        console.log('Sequence 26: Eradicating Delta account...');
        await new Promise((resolve, reject) => deltaAccount.del(err => err ? reject(err) : resolve()));

        console.log('Sequence 27: Verifying Gamma social graph post-Delta eradication...');
        await checkSocialConnections(gammaAccount, [], []);

        console.log('Sequence 28: Eradicating Gamma account...');
        await new Promise((resolve, reject) => gammaAccount.del(err => err ? reject(err) : resolve()));

        console.log('All comprehensive account validations successfully concluded!');

    } catch (validationError) {
        console.error('Comprehensive account validation FAILED:', validationError.message);
    }
}

performComprehensiveAccountValidation();