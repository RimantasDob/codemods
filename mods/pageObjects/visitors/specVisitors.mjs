import { addPageToTest, looksLike } from '../../../utils/utils.mjs';

import updateVariableDeclaration from '../actions/variableDeclaration.mjs';
import { updateBrowser, updateBrowserWithReturnValue } from '../actions/updateBrowser.mjs';
import itFunc from '../actions/it.mjs';
import describeFunc from '../actions/describe.mjs';
let imports = [];

export default {
    getImports() {
        return imports;
    },
    getVisitors(filePath) {
        return {
            visitProgram(path) {
                imports = [];
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
                    expression: {
                        argument: { callee: { object: { name: name => name === 'browser' } } },
                    },
                });
                if (isBrowser) {
                    updateBrowser(path.node.expression);
                    addPageToTest(path);
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
            visitAwaitExpression(path) {
                const isBrowser = looksLike(path.node, {
                    argument: { callee: { object: { name: name => name === 'browser' } } },
                });
                if (isBrowser) {
                    console.log(filePath);
                    console.log(path.node.argument.callee.property.name);
                    updateBrowser(path.node);
                    updateBrowserWithReturnValue(path.node);
                    addPageToTest(path);
                }
                this.traverse(path);
            },
        };
    },
};
