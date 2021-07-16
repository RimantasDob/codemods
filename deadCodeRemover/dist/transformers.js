"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countFunctionsUsed = exports.fileImports = exports.methodTransformer = exports.getImports = exports.getList = void 0;
const recast_1 = require("recast");
const utils_1 = require("./utils");
const path_1 = require("path");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
let list = {};
let imports = {};
exports.getList = () => lodash_clonedeep_1.default(list);
exports.getImports = () => lodash_clonedeep_1.default(imports);
function methodTransformer() {
    list = {};
    return function (ast) {
        recast_1.visit(ast, {
            visitClassMethod: function (path) {
                const isClassMethod = utils_1.looksLike(path, { node: { kind: "method" } });
                if (!isClassMethod) {
                    return false;
                }
                list[path.node.key.name] = 0;
                this.traverse(path);
            },
            visitObjectExpression(path) {
                const isImport = utils_1.looksLike(path, {
                    parentPath: {
                        node: {
                            left: {
                                object: {
                                    name: (n) => typeof n === "string" && n === "module",
                                },
                                property: {
                                    name: (n) => typeof n === "string" && n === "exports",
                                },
                            },
                        },
                    },
                });
                if (!isImport) {
                    return false;
                }
                const functionNames = path.node.properties
                    // @ts-ignore
                    .map((el) => { var _a; return (_a = el === null || el === void 0 ? void 0 : el.key) === null || _a === void 0 ? void 0 : _a.name; })
                    .filter((el) => el);
                list = functionNames.reduce((obj, key) => {
                    return { ...obj, [key]: 0 };
                }, list);
                return false;
            },
        });
    };
}
exports.methodTransformer = methodTransformer;
function fileImports(filePath) {
    const directoryPath = filePath.replace(/\w+\.js$/, "");
    return function (ast) {
        recast_1.visit(ast, {
            visitVariableDeclarator(path) {
                var _a;
                const isImport = utils_1.looksLike(path, {
                    node: {
                        id: {
                            type: (_type) => typeof _type === "string" &&
                                (_type === "Identifier" || _type === "ObjectPattern"),
                        },
                        init: {
                            callee: {
                                name: (val) => typeof val === "string" && val === "require",
                            },
                        },
                    },
                });
                if (!isImport) {
                    return false;
                }
                const key = 
                // @ts-ignore
                path.node.id.name || path.node.id.properties[0].value.name;
                // @ts-ignore
                const value = (_a = path.node.init) === null || _a === void 0 ? void 0 : _a.arguments[0].value;
                //Save only file imports
                if (value.includes("./")) {
                    const file = `${path_1.join(directoryPath, value)}.js`;
                    imports[key] = file;
                }
                return false;
            },
        });
    };
}
exports.fileImports = fileImports;
function countFunctionsUsed(functionListObj, imports, currentFile) {
    return function (ast) {
        recast_1.visit(ast, {
            visitCallExpression(path) {
                var _a, _b, _c, _d;
                // @ts-ignore
                const callee = (_b = (_a = path.node.callee) === null || _a === void 0 ? void 0 : _a.object) === null || _b === void 0 ? void 0 : _b.name;
                // @ts-ignore
                const functionName = (_d = (_c = path.node.callee) === null || _c === void 0 ? void 0 : _c.property) === null || _d === void 0 ? void 0 : _d.name;
                const isThisExpression = utils_1.looksLike(path, {
                    node: {
                        callee: {
                            object: {
                                type: "ThisExpression",
                            },
                        },
                    },
                });
                if (isThisExpression) {
                    if (functionListObj[currentFile] &&
                        functionListObj[currentFile].hasOwnProperty(functionName)) {
                        ++functionListObj[currentFile][functionName];
                        return false;
                    }
                }
                const isImport = utils_1.looksLike(path, {
                    node: {
                        callee: {
                            object: {
                                name: (n) => typeof n === "string" && imports.hasOwnProperty(n),
                            },
                        },
                    },
                });
                const isImportedFunction = utils_1.looksLike(path, {
                    node: {
                        callee: {
                            name: (n) => typeof n === "string" && imports.hasOwnProperty(n),
                        },
                    },
                });
                if (isImport || isImportedFunction) {
                    const importCallee = imports[callee];
                    if (functionListObj[importCallee] &&
                        functionListObj[importCallee].hasOwnProperty(functionName)) {
                        ++functionListObj[importCallee][functionName];
                    }
                }
                return this.traverse(path);
            },
        });
    };
}
exports.countFunctionsUsed = countFunctionsUsed;
