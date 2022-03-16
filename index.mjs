import yargsParser from 'yargs-parser';

import updateCode from './mods/pageObjects/main.mjs';
import updateImports from './mods/imports/main.mjs';
import funcArgs from './mods/funcArgs/main.mjs';
import browserCount from './mods/browserCount/main.mjs';

const main = () => {
    const args = process.argv.slice(2);
    const argsParsed = yargsParser(args);
    if (argsParsed.u) {
        updateCode();
    } else if (argsParsed.count) {
        browserCount();
    } else if (argsParsed.func) {
        const funcNames = argsParsed.func.split(',');
        funcArgs(funcNames);
    } else if (argsParsed.imports) {
        updateImports();
    }
};

main();
