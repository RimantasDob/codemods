import { looksLike } from '../../utils/utils.mjs';
import { types } from 'recast';

const builders = types.builders;

import updateVariableDeclaration from './variableDeclaration.mjs';
import { updateBrowser } from './updateBrowser.mjs';
import itFunc from './it.mjs';
import describeFunc from './describe.mjs';
let imports = [];

const argument = { callee: { object: { name: name => name === 'browser' } } };

const getParentNode = path => {
    const parent = path.parentPath;
    if (parent.node.type === 'Program') {
        return null;
    } else if (parent.node.type === 'CallExpression') {
        const isTest = looksLike(parent.node, { callee: { name: n => n === 'test' } });
        if (isTest) {
            return parent;
        } else {
            return getParentNode(parent);
        }
    } else {
        return getParentNode(parent);
    }
};

export default {
    resetImports() {
        imports = [];
    },
    getImports() {
        return imports;
    },
    getVisitors(filePath) {
        return {
            visitProgram(path) {
                updateVariableDeclaration(path, filePath, imports);
                this.traverse(path);
            },
            visitExpressionStatement(path) {
                const isDescribe = looksLike(path.node, {
                    expression: {
                        callee: { name: n => n === 'describe' },
                    },
                });
                if (isDescribe) {
                    describeFunc(path, imports);
                }
                const isIt = looksLike(path.node, {
                    expression: {
                        callee: { name: n => n === 'it' },
                    },
                });
                if (isIt) {
                    itFunc(path.node);
                }
                const isBrowser = looksLike(path.node, {
                    expression: { argument },
                });
                if (isBrowser) {
                    updateBrowser(path.node.expression);
                    const parent = getParentNode(path);
                    if (parent) {
                        parent.node.arguments[1].params = [
                            builders.objectPattern([
                                {
                                    type: 'ObjectProperty',
                                    kind: 'init',
                                    shorthand: true,
                                    key: builders.identifier('page'),
                                    value: builders.identifier('page'),
                                },
                            ]),
                        ];
                    }
                }
                this.traverse(path);
            },
            visitMemberExpression(path) {
                const isImported = looksLike(path.node, {
                    object: { name: n => imports.some(imp => imp.past === n) },
                });
                if (isImported) {
                    const calleeName = path.node.object.name;
                    const future = imports.filter(imp => imp.past === calleeName)[0].future;
                    path.node.object.name = future;
                }
                this.traverse(path);
            },
        };
    },
};
