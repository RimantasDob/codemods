import { looksLike } from '../../../utils/utils.mjs';

import { updateBrowser, updateBrowserWithReturnValue } from '../actions/updateBrowser.mjs';
import updateVariableDeclaration from '../actions/variableDeclaration.mjs';
import updateImportedPageObjects from '../actions/importedPageObjects.mjs';
import constructor from '../actions/constructor.mjs';
import filterOut from '../comments/filterOut.mjs';

const argument = { callee: { object: { name: name => name === 'browser' } } };

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
            visitClassMethod(path) {
                if (path.node.key.name === 'constructor') {
                    constructor(path.node, imports);
                }
                this.traverse(path);
            },
            visitMemberExpression(path) {
                updateImportedPageObjects(path.node, imports);
                this.traverse(path);
            },
            // visitBlockStatement(path) {
            //     _clg && console.log('visitBlockStatement');
            //     filterOut(path.node, 'pause');
            //     filterOut(path.node, 'scroll');
            //     filterOut(path.node, 'scrollIntoView');
            //     filterOut(path.node, 'scrollToBottom');
            //     this.traverse(path);
            // },
            // visitVariableDeclarator(path) {
            //     _clg && console.log('visitVariableDeclarator');
            //     const isBrowser = looksLike(path.node, {
            //         init: { argument },
            //     });
            //     if (isBrowser) {
            //         updateBrowserWithReturnValue(path.node.init);
            //     }
            //     this.traverse(path);
            // },
            // visitIfStatement(path) {
            //     _clg && console.log('visitIfStatement');
            //     const isBrowser = looksLike(path.node, {
            //         test: { argument },
            //     });
            //     if (isBrowser) {
            //         updateBrowserWithReturnValue(path.node.test);
            //     }
            //     this.traverse(path);
            // },
            // visitExpressionStatement(path) {
            //     _clg && console.log('visitExpressionStatement');
            //     const isBrowser = looksLike(path.node, {
            //         expression: { argument },
            //     });
            //     if (isBrowser) {
            //         updateBrowser(path.node.expression);
            //     }
            //     this.traverse(path);
            // },
            // visitReturnStatement(path) {
            //     _clg && console.log('visitReturnStatement');
            //     const isBrowser = looksLike(path.node, { argument });
            //     if (isBrowser) {
            //         updateBrowser(path.node);
            //     }
            //     this.traverse(path);
            // },
            // visitAwaitExpression(path) {
            //     _clg && console.log('visitAwaitExpression');
            //     const isBrowser = looksLike(path.node, { argument });
            //     if (isBrowser) {
            //         updateBrowser(path.node);
            //     }
            //     this.traverse(path);
            // },
        };
    },
};
