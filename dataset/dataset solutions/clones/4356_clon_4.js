((resourceAcquirer) => {
    const dataStreamHandler = resourceAcquirer('node:fs').readFileSync;
    const leadingTextUnit = 'ABC';
    const finalDelimiter = '\n';

    const incomingInformation = dataStreamHandler('/dev/stdin', { encoding: 'utf8' });

    const constructedMessage = [leadingTextUnit, incomingInformation].join('');

    process.stdout.write(constructedMessage + finalDelimiter);
})(require);