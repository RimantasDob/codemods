import { looksLike } from '../../utils/utils.mjs';

import constructArgs from './constructArgs.mjs';
import updateVariableDeclaration from './variableDeclaration.mjs';
import updateImportedPageObjects from './importedPageObjects.mjs';
import refresh from './refresh.mjs';
import getFunc from './getFunc.mjs';
import isVisible from './isVisible.mjs';
import constructor from './constructor.mjs';
import click from './click.mjs';
import keys from './keys.mjs';
import setFunc from './setFunc.mjs';
import filterOut from './filterOut.mjs';

const updateBrowser = expression => {
    const calleeProperty = expression.argument.callee.property.name;
    if (
        calleeProperty === 'click' ||
        calleeProperty === 'waitAndClick' ||
        calleeProperty === 'scrollAndClick'
    ) {
        click(expression);
    } else if (
        calleeProperty === 'setValue' ||
        calleeProperty === 'waitAndSetValue' ||
        calleeProperty === 'setValueByInjection'
    ) {
        const selector = expression.argument.arguments[0];
        const value = expression.argument.arguments[1];
        setFunc(expression, 'fill', selector, [value]);
    } else if (calleeProperty === 'refresh') {
        refresh(expression);
    } else if (calleeProperty === 'getValue') {
        const selector = expression.argument.arguments[0];
        setFunc(expression, 'inputValue', selector);
    } else if (calleeProperty === 'moveToObject') {
        const selector = expression.argument.arguments[0];
        setFunc(expression, 'hover', selector);
    } else if (calleeProperty === 'keys') {
        const keyValue = expression.argument.arguments[0];
        keys(expression, keyValue);
    } else if (calleeProperty === 'waitForVisible' || calleeProperty === 'waitForExist') {
        const selector = expression.argument.arguments[0];
        const timeout = expression.argument.arguments[1]?.value || 0;
        const reverse = expression.argument.arguments[2] ?? false;
        const args = {};
        if (reverse) {
            args.state = 'detached';
        }
        if (typeof timeout === 'number' && timeout > 30000) {
            args.timeout = timeout;
        }

        const argsObj = constructArgs({ ...args });
        setFunc(expression, 'waitFor', selector, argsObj);
    } else if (calleeProperty === 'selectByValue') {
        const selector = expression.argument.arguments[0];
        const arg = expression.argument.arguments[1];
        const value = arg.name ? arg : arg.value;
        const argsObj = constructArgs({ value });
        setFunc(expression, 'selectOption', selector, argsObj);
    } else if (calleeProperty === 'selectByVisibleText') {
        const selector = expression.argument.arguments[0];
        const arg = expression.argument.arguments[1];
        const label = arg.name ? arg : arg.value;
        const argsObj = constructArgs({ label });
        setFunc(expression, 'selectOption', selector, argsObj);
    } else if (calleeProperty === 'selectByIndex') {
        const selector = expression.argument.arguments[0];
        const arg = expression.argument.arguments[1];
        const index = arg.name ? arg : arg.value;
        const argsObj = constructArgs({ index });
        setFunc(expression, 'selectOption', selector, argsObj);
    }
};

const updateBrowserWithReturnValue = init => {
    const calleeProperty = init.argument.callee.property.name;
    if (calleeProperty === 'getUrl') {
        getFunc(init, 'url');
    } else if (calleeProperty === 'getTitle') {
        getFunc(init, 'title');
    } else if (calleeProperty === 'isVisible') {
        const args = init.argument.arguments;
        isVisible(init, args);
    } else if (calleeProperty === 'getValue') {
        const selector = init.argument.arguments[0];
        setFunc(init, 'inputValue', selector);
    } else if (calleeProperty === 'waitForVisible') {
        const selector = init.argument.arguments[0];
        const timeout = init.argument.arguments[1] || 0;
        const reverse = init.argument.arguments[2] ?? false;
        const args = {};
        if (reverse) {
            args.state = 'detached';
        }
        if (typeof timeout === 'number' && timeout > 30000) {
            args.timeout = timeout;
        }
        const argsObj = constructArgs({ ...args });
        setFunc(init, 'waitFor', selector, argsObj);
    }
};
const _clg = false;
const argument = { callee: { object: { name: name => name === 'browser' } } };

export default {
    getVisitors(filePath) {
        const imports = [];
        return {
            visitProgram(path) {
                _clg && console.log('visitProgram');
                updateVariableDeclaration(path, filePath, imports);
                this.traverse(path);
            },
            visitClassMethod(path) {
                _clg && console.log('visitClassMethod');
                if (path.node.key.name === 'constructor') {
                    constructor(path.node, imports);
                }
                this.traverse(path);
            },
            visitMemberExpression(path) {
                _clg && console.log('visitMemberExpression');
                updateImportedPageObjects(path.node, imports);
                this.traverse(path);
            },
            visitBlockStatement(path) {
                _clg && console.log('visitBlockStatement');
                filterOut(path.node, 'pause');
                filterOut(path.node, 'scroll');
                filterOut(path.node, 'scrollIntoView');
                filterOut(path.node, 'scrollToBottom');
                this.traverse(path);
            },
            visitVariableDeclarator(path) {
                _clg && console.log('visitVariableDeclarator');
                const isBrowser = looksLike(path.node, {
                    init: { argument },
                });
                if (isBrowser) {
                    updateBrowserWithReturnValue(path.node.init);
                }
                this.traverse(path);
            },
            visitIfStatement(path) {
                _clg && console.log('visitIfStatement');
                const isBrowser = looksLike(path.node, {
                    test: { argument },
                });
                if (isBrowser) {
                    updateBrowserWithReturnValue(path.node.test);
                }
                this.traverse(path);
            },
            visitExpressionStatement(path) {
                _clg && console.log('visitExpressionStatement');
                const isBrowser = looksLike(path.node, {
                    expression: { argument },
                });
                if (isBrowser) {
                    updateBrowser(path.node.expression);
                }
                this.traverse(path);
            },
            visitReturnStatement(path) {
                _clg && console.log('visitReturnStatement');
                const isBrowser = looksLike(path.node, { argument });
                if (isBrowser) {
                    updateBrowser(path.node);
                }
                this.traverse(path);
            },
        };
    },
};
