import fs from 'fs';
import glob from 'glob';
import yargsParser from 'yargs-parser';
import * as babel from '@babel/parser';

import data from './data';
const _data: Record<string, string[]> = data();

import { parse, print, RunOptions, Transformer } from 'recast';
import {
    getList,
    getImports,
    methodTransformer,
    fileImports,
    countFunctionsUsed,
    FunctionListObj,
} from './transformers';

function defaultWriteback(output: string) {
    process.stdout.write(output);
}

function runFile(path: any, transformer: Transformer, options?: RunOptions) {
    const code = fs.readFileSync(path, { encoding: 'utf-8' });
    runString(code, transformer, options);
}

function runString(code: string, transformer: Transformer, options?: RunOptions) {
    const writeback = (options && options.writeback) || defaultWriteback;
    try {
        transformer(parse(code, options), function (node: any) {
            writeback(print(node, options).code);
        });
    } catch (e) {
        console.log(e);
    }
}
// type MostPopular = { func: string; count: number };

// const mostPopular = () => {
//   const mostPopular = Object.keys(data)
//     .reduce((arr: MostPopular[], key: string) => {
//       const curr = [];
//       //@ts-ignore
//       for (const [key2, val] of Object.entries(data[key])) {
//         curr.push({ func: `${key}:${key2}`, count: val as number });
//       }
//       return [...arr, ...curr];
//     }, [])
//     .sort((a, b) => b.count - a.count);
//   console.log(mostPopular);
// };

const getFunctionUsedCount = () => {
    const fullPath = [
        '/Users/rimantas/projects/dibs-toho/mg/tests/**/*.js',
        '/Users/rimantas/projects/dibs-toho/mg/pageObjects/**/*.js',
        '/Users/rimantas/projects/dibs-toho/mg/helpers/**/*.js',
    ];
    const filePaths = fullPath.flatMap(file => glob.sync(file));

    const functionListObj: FunctionListObj = {};
    for (const filePath of filePaths) {
        runFile(filePath, methodTransformer(), {
            parser: { parse: babel.parse },
        });
        functionListObj[filePath] = getList();
    }

    const allFilePaths = glob
        .sync('/Users/rimantas/projects/dibs-toho/mg/**/*.js')
        .filter(
            file =>
                !(
                    file.includes('/extensions/') ||
                    file.includes('/node_modules/') ||
                    file.includes('/dist/') ||
                    file.includes('/mg/index.js') ||
                    file.includes('/scripts/') ||
                    file.includes('/tmp/')
                )
        );

    for (const filePath of allFilePaths) {
        runFile(filePath, fileImports(filePath), {
            parser: { parse: babel.parse },
        });
        const imports = getImports();

        runFile(filePath, countFunctionsUsed(functionListObj, imports, filePath), {
            parser: { parse: babel.parse },
        });
    }
    const stuff = Object.keys(functionListObj).reduce((obj, key) => {
        const regex = /_spec\.js$/;
        if (regex.test(key) && Object.keys(functionListObj[key]).length === 0) {
            return obj;
        }
        const filtered: string[] = [];
        for (const [_key, val] of Object.entries(functionListObj[key])) {
            if (val === 0 && _data[key]) {
                //&& !_data[key].includes(_key)) {
                filtered.push(_key);
            }
        }
        if (filtered.length === 0) {
            return obj;
        }
        return { ...obj, [key]: filtered };
    }, {});
    console.log(stuff);
    fs.writeFileSync('data.json', JSON.stringify(stuff));
};

const getNotImportedFiles = () => {
    const imported: Set<string> = new Set();
    const possibleImports = [
        '/Users/rimantas/projects/dibs-toho/mg/tests/**/*.js',
        '/Users/rimantas/projects/dibs-toho/mg/pageObjects/**/*.js',
        '/Users/rimantas/projects/dibs-toho/mg/helpers/**/*.js',
        '/Users/rimantas/projects/dibs-toho/mg/mocks/**/*.js',
    ]
        .flatMap(filePath => glob.sync(filePath))
        .filter(filePath => !filePath.includes('_spec.js'));

    console.log(possibleImports.length);
    let allFilePaths = glob
        .sync('/Users/rimantas/projects/dibs-toho/mg/**/*.js')
        .filter(
            file =>
                !(
                    file.includes('/extensions/') ||
                    file.includes('/node_modules/') ||
                    file.includes('/scripts/') ||
                    file.includes('/tmp/')
                )
        );
    console.log(allFilePaths.length);

    for (const filePath of allFilePaths) {
        runFile(filePath, fileImports(filePath), {
            parser: { parse: babel.parse },
        });
        const imports = getImports() || {};
        for (const val of Object.values(imports)) {
            imported.add(val);
        }
        for (const imp of imported) {
            const index = possibleImports.findIndex(filePath => filePath === 'imp');
            allFilePaths = allFilePaths.filter((val, i) => i !== index);
        }
    }
    console.log(allFilePaths);
};

const main = () => {
    const args = process.argv.slice(2);
    const argsParsed = yargsParser(args);
    if (argsParsed.m) {
        // return mostPopular();
    } else if (argsParsed.f) {
        return getFunctionUsedCount();
    } else if (argsParsed.u) {
        return getNotImportedFiles();
    }
};

main();
