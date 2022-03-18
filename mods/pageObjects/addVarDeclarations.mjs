export default (code, imports) =>
    code
        .split('\n')
        .flatMap(line => {
            const entry = imports.filter(imp => line.includes(`let ${imp.future}`))?.[0];
            if (entry) {
                const s = line.match(/^\s+/g)?.[0] || '';
                return [s + entry.comment, line];
            }
            return line;
        })
        .join('\n');
