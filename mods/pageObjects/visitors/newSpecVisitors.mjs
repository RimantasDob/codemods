import { addPageToTest, looksLike } from '../../../utils/utils.mjs';

import updateVariableDeclaration from '../actions/variableDeclaration.mjs';
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
            visitCallExpression(path) {
                const navigateHelper = looksLike(path.node, {
                    callee: {
                        object: { name: n => n === 'navigateHelper' },
                        property: { name: n => n === 'navigateToPage' },
                    },
                });
                if (navigateHelper) {
                    path.node.callee.object.name = 'page';
                    addPageToTest(path);
                }
                const spinnerHelper = looksLike(path.node, {
                    callee: {
                        object: { name: n => n === 'spinnerHelper' },
                        property: { name: n => n === 'handleLoadingSpinner' },
                    },
                });
                if (spinnerHelper) {
                    path.node.callee.object.name = 'page';
                    addPageToTest(path);
                }
                this.traverse(path);
            },
        };
    },
};
