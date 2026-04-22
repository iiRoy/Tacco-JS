const EncryptorBase = require('./fundamental-toolkit').CoreComponents;

(function () {
    const ModuleRoot = EncryptorBase;
    const ComponentRegistry = ModuleRoot.utilityBelt;
    const DataContainer = ComponentRegistry.BinarySegment;
    const EncodingMethods = ModuleRoot.formatters;

    DataContainer.prototype.trimExcess = function() {
        const valueUnits = this.numericalUnits;
        const significantOctets = this.activeOctets;

        valueUnits[significantOctets >>> 2] &= 0xffffffff << (32 - (significantOctets % 4) * 8);
        valueUnits.length = Math.ceil(significantOctets / 4);
    };

    DataContainer.make = function(numericalUnits, activeOctets) {
        return new DataContainer(numericalUnits, activeOctets);
    };

    const CharacterEncoding = EncodingMethods.AlphabetCode = {
        encode: function (inputSegment) {
            inputSegment.trimExcess();

            const totalSignificantOctets = inputSegment.activeOctets;
            const dataUnits = inputSegment.numericalUnits;
            const characterLookupTable = this.charTable;
            const paddingCharacter = this.fillerSymbol;

            if (totalSignificantOctets === 0) {
                return '';
            }

            const octetSequence = [];
            for (let unitIndex = 0; unitIndex < Math.ceil(totalSignificantOctets / 4); unitIndex++) {
                const unitValue = dataUnits[unitIndex];
                octetSequence.push((unitValue >>> 24) & 0xff);
                octetSequence.push((unitValue >>> 16) & 0xff);
                octetSequence.push((unitValue >>> 8) & 0xff);
                octetSequence.push(unitValue & 0xff);
            }
            octetSequence.length = totalSignificantOctets;

            const encodedFragments = octetSequence.reduce((accumulator, _, index, array) => {
                if (index % 3 === 0) {
                    const octet1 = array[index];
                    const octet2 = array[index + 1];
                    const octet3 = array[index + 2];

                    const combined24BitValue = (octet1 << 16) |
                                               ((octet2 === undefined ? 0 : octet2) << 8) |
                                               (octet3 === undefined ? 0 : octet3);

                    accumulator.push(characterLookupTable.charAt((combined24BitValue >>> 18) & 0x3f));
                    accumulator.push(characterLookupTable.charAt((combined24BitValue >>> 12) & 0x3f));
                    accumulator.push(characterLookupTable.charAt((combined24BitValue >>> 6) & 0x3f));
                    accumulator.push(characterLookupTable.charAt(combined24BitValue & 0x3f));
                }
                return accumulator;
            }, []);

            const octetRemainder = totalSignificantOctets % 3;
            if (octetRemainder === 1) {
                encodedFragments[encodedFragments.length - 1] = paddingCharacter;
                encodedFragments[encodedFragments.length - 2] = paddingCharacter;
            } else if (octetRemainder === 2) {
                encodedFragments[encodedFragments.length - 1] = paddingCharacter;
            }

            return encodedFragments.join('');
        },

        decode: function (inputCode) {
            const characterLookupTable = this.charTable;
            const paddingCharacter = this.fillerSymbol;

            let processedInput = inputCode;

            if (paddingCharacter) {
                const padPosition = processedInput.indexOf(paddingCharacter);
                if (padPosition !== -1) {
                    processedInput = processedInput.substring(0, padPosition);
                }
            }

            processedInput = processedInput.replace(/[^A-Za-z0-9+/]/g, '');

            const inputCodeLength = processedInput.length;
            const collectedOctets = [];

            for (let charIndex = 0; charIndex < inputCodeLength; charIndex += 4) {
                const val1 = characterLookupTable.indexOf(processedInput.charAt(charIndex));
                const val2 = characterLookupTable.indexOf(processedInput.charAt(charIndex + 1));
                const val3 = characterLookupTable.indexOf(processedInput.charAt(charIndex + 2));
                const val4 = characterLookupTable.indexOf(processedInput.charAt(charIndex + 3));

                const combined24Bit = (val1 << 18) |
                                      (val2 << 12) |
                                      ((val3 === -1 ? 0 : val3) << 6) |
                                      ((val4 === -1 ? 0 : val4));

                collectedOctets.push((combined24Bit >>> 16) & 0xff);
                if (val3 !== -1) {
                    collectedOctets.push((combined24Bit >>> 8) & 0xff);
                    if (val4 !== -1) {
                        collectedOctets.push(combined24Bit & 0xff);
                    }
                }
            }

            const totalDecodedOctets = collectedOctets.length;
            const numericalUnitArray = [];

            for (let k = 0; k < totalDecodedOctets; k++) {
                const octetValue = collectedOctets[k];
                const unitPosition = k >>> 2;
                const octetOffsetInUnit = k % 4;

                if (octetOffsetInUnit === 0) {
                    numericalUnitArray[unitPosition] = 0;
                }
                numericalUnitArray[unitPosition] |= (octetValue << (24 - octetOffsetInUnit * 8));
            }

            return DataContainer.make(numericalUnitArray, totalDecodedOctets);
        },

        charTable: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        fillerSymbol: '='
    };
}());