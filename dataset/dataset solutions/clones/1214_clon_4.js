async function obtainAndPresent() {
  for await (const contentSegment of global.process.stdin) {
    const outputString = contentSegment.toString('utf8');
    global.process.stdout.write(outputString + '\n');
  }
}

obtainAndPresent();