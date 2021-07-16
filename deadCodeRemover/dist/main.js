"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const yargs_parser_1 = __importDefault(require("yargs-parser"));
const babel = __importStar(require("@babel/parser"));
const data_1 = __importDefault(require("./data"));
const _data = data_1.default();
const recast_1 = require("recast");
const transformers_1 = require("./transformers");
function defaultWriteback(output) {
    process.stdout.write(output);
}
function runFile(path, transformer, options) {
    const code = fs_1.default.readFileSync(path, { encoding: "utf-8" });
    runString(code, transformer, options);
}
function runString(code, transformer, options) {
    const writeback = (options && options.writeback) || defaultWriteback;
    try {
        transformer(recast_1.parse(code, options), function (node) {
            writeback(recast_1.print(node, options).code);
        });
    }
    catch (e) {
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
        "/Users/rimantas/projects/dibs-toho/mg/tests/**/*.js",
        "/Users/rimantas/projects/dibs-toho/mg/pageObjects/**/*.js",
        "/Users/rimantas/projects/dibs-toho/mg/helpers/**/*.js",
    ];
    const filePaths = fullPath.flatMap((file) => glob_1.default.sync(file));
    const functionListObj = {};
    for (const filePath of filePaths) {
        runFile(filePath, transformers_1.methodTransformer(), {
            parser: { parse: babel.parse },
        });
        functionListObj[filePath] = transformers_1.getList();
    }
    const allFilePaths = glob_1.default
        .sync("/Users/rimantas/projects/dibs-toho/mg/**/*.js")
        .filter((file) => !(file.includes("/extensions/") ||
        file.includes("/node_modules/") ||
        file.includes("/dist/") ||
        file.includes("/mg/index.js") ||
        file.includes("/scripts/") ||
        file.includes("/tmp/")));
    for (const filePath of allFilePaths) {
        runFile(filePath, transformers_1.fileImports(filePath), {
            parser: { parse: babel.parse },
        });
        const imports = transformers_1.getImports();
        runFile(filePath, transformers_1.countFunctionsUsed(functionListObj, imports, filePath), {
            parser: { parse: babel.parse },
        });
    }
    const stuff = Object.keys(functionListObj).reduce((obj, key) => {
        const regex = /_spec\.js$/;
        if (regex.test(key) && Object.keys(functionListObj[key]).length === 0) {
            return obj;
        }
        const filtered = [];
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
    fs_1.default.writeFileSync("data.json", JSON.stringify(stuff));
};
const getNotImportedFiles = () => {
    const imported = new Set();
    const possibleImports = [
        "/Users/rimantas/projects/dibs-toho/mg/tests/**/*.js",
        "/Users/rimantas/projects/dibs-toho/mg/pageObjects/**/*.js",
        "/Users/rimantas/projects/dibs-toho/mg/helpers/**/*.js",
        "/Users/rimantas/projects/dibs-toho/mg/mocks/**/*.js",
    ]
        .flatMap((filePath) => glob_1.default.sync(filePath))
        .filter((filePath) => !filePath.includes("_spec.js"));
    console.log(possibleImports.length);
    let allFilePaths = glob_1.default
        .sync("/Users/rimantas/projects/dibs-toho/mg/**/*.js")
        .filter((file) => !(file.includes("/extensions/") ||
        file.includes("/node_modules/") ||
        file.includes("/scripts/") ||
        file.includes("/tmp/")));
    console.log(allFilePaths.length);
    for (const filePath of allFilePaths) {
        runFile(filePath, transformers_1.fileImports(filePath), {
            parser: { parse: babel.parse },
        });
        const imports = transformers_1.getImports() || {};
        for (const val of Object.values(imports)) {
            imported.add(val);
        }
        for (const imp of imported) {
            const index = possibleImports.findIndex((filePath) => filePath === "imp");
            allFilePaths = allFilePaths.filter((val, i) => i !== index);
        }
    }
    console.log(allFilePaths);
};
const main = () => {
    const args = process.argv.slice(2);
    const argsParsed = yargs_parser_1.default(args);
    if (argsParsed.m) {
        // return mostPopular();
    }
    else if (argsParsed.f) {
        return getFunctionUsedCount();
    }
    else if (argsParsed.u) {
        return getNotImportedFiles();
    }
};
main();
