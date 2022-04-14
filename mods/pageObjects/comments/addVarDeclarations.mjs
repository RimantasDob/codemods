export default (oldCode, imports) => {
    const code = [];
    const lines = oldCode.split('\n');
    for (const line of lines) {
        const entry = imports.filter(
            imp => line.includes(`let ${imp.future};`) || line.includes(`let ${imp.newName};`)
        )?.[0];
        const last = code.length === 0 ? 0 : code.length - 1;
        if (entry && !code[last].includes(entry.comment)) {
            const s = line.match(/^\s+/g)?.[0] || '';
            const newLine = s + entry.comment + '\n' + line;
            code.push(newLine);
        } else {
            code.push(line);
        }
    }
    return code.join('\n');
};
