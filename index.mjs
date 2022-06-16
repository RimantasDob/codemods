import yargsParser from 'yargs-parser';

import updateCode from './mods/pageObjects/main.mjs';
import updateImports from './mods/imports/main.mjs';
import funcArgs from './mods/funcArgs/main.mjs';
import browserCount from './mods/browserCount/main.mjs';
import rename from './mods/renameFiles/main.mjs';

const main = () => {
    const args = process.argv.slice(2);
    const argsParsed = yargsParser(args);
    if ('u' in argsParsed) {
        updateCode(argsParsed.file, argsParsed.u);
    } else if (argsParsed.count) {
        browserCount();
    } else if (argsParsed.func) {
        const funcNames = argsParsed.func.split(',');
        funcArgs(funcNames);
    } else if (argsParsed.imports) {
        updateImports();
    } else if (argsParsed.rename) {
        rename();
    }
};

main();
