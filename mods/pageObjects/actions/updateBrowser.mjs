import constructArgs from './constructArgs.mjs';
import refresh from './refresh.mjs';
import getFunc from './getFunc.mjs';
import locatorWithReturnValue from './locatorWithReturnValue.mjs';
import click from './click.mjs';
import keys from './keys.mjs';
import setFunc from './setFunc.mjs';

export const updateBrowser = expression => {
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
        const value = arg.value ? arg.value : arg;
        const argsObj = constructArgs({ value });
        setFunc(expression, 'selectOption', selector, argsObj);
    } else if (calleeProperty === 'selectByVisibleText') {
        const selector = expression.argument.arguments[0];
        const arg = expression.argument.arguments[1];
        const label = arg.value ? arg.value : arg;
        const argsObj = constructArgs({ label });
        setFunc(expression, 'selectOption', selector, argsObj);
    } else if (calleeProperty === 'selectByIndex') {
        const selector = expression.argument.arguments[0];
        const arg = expression.argument.arguments[1];
        const index = arg.value ? arg.value : arg;
        const argsObj = constructArgs({ index });
        setFunc(expression, 'selectOption', selector, argsObj);
    } else if (calleeProperty === 'getText') {
        const selector = expression.argument.arguments;
        locatorWithReturnValue(expression, 'innerText', selector, []);
    } else if (calleeProperty === 'getAttribute') {
        const selector = expression.argument.arguments[0];
        const attribute = expression.argument.arguments[1];
        locatorWithReturnValue(expression, 'getAttribute', [selector], [attribute]);
    }
};

export const updateBrowserWithReturnValue = init => {
    const calleeProperty = init.argument.callee.property.name;
    // console.log(calleeProperty);
    if (calleeProperty === 'getUrl') {
        getFunc(init, 'url');
    } else if (calleeProperty === 'getTitle') {
        getFunc(init, 'title');
    } else if (calleeProperty === 'isVisible') {
        const selector = init.argument.arguments;
        locatorWithReturnValue(init, 'isVisible', selector, []);
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
    } else if (calleeProperty === 'getText') {
        const selector = init.argument.arguments;
        locatorWithReturnValue(init, 'innerText', selector, []);
    } else if (calleeProperty === 'getAttribute') {
        const selector = init.argument.arguments[0];
        const attribute = init.argument.arguments[1];
        locatorWithReturnValue(init, 'getAttribute', [selector], [attribute]);
    }
};
