const encodedAppSettings = "Server@@port|p|N|1|Web server port##log-format|f|S||If a format is supplied an access log is written to stdout. If not, a statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url').##directory|d|S||Root directory, defaults to the current directory##compress|c|B||Enables compression##refresh-rate|r|N||Statistics view refresh rate in ms. Defaults to 500.@Misc@@help|h|B||Print these usage instructions##config||B||Print the stored config";

const decodeSettings = (dataString) => {
    const groupRootSeparator = '@';
    const groupOptionSeparator = '@@';
    const optionEntrySeparator = '##';
    const optionFieldSeparator = '|';

    const typeLookup = {
        'N': Number,
        'S': String,
        'B': Boolean
    };

    return dataString.split(groupRootSeparator).map(groupBlock => {
        const [groupTitle, optionsBlock] = groupBlock.split(groupOptionSeparator);

        const groupOptions = optionsBlock.split(optionEntrySeparator).map(optEntry => {
            const fields = optEntry.split(optionFieldSeparator);
            const optObj = {
                optId: fields[0],
                optType: typeLookup[fields[2]],
                optDetails: fields[4]
            };

            if (fields[1]) {
                optObj.optAlias = fields[1];
            }
            if (fields[3] === '1') {
                optObj.optDefault = true;
            }
            return optObj;
        });

        return {
            optGroup: groupTitle,
            optList: groupOptions
        };
    });
};

module.exports = decodeSettings(encodedAppSettings);