export default code => {
    if (!code.includes('@ts-check')) {
        return ['// @ts-check', code].join('\n');
    } else if (!code.includes('dibs-playwright')) {
        return code.split('\n').reduce(
            ({ lines, comment }, line) => {
                if (!/^(\/\/|\/\*)/g.test(line) && comment) {
                    return {
                        lines:
                            lines +
                            '\n' +
                            "const { test } = require('dibs-playwright');" +
                            '\n' +
                            line,
                        comment: false,
                    };
                } else {
                    return { lines: lines + '\n' + line, comment };
                }
            },
            { lines: '', comment: true }
        ).lines;
    } else {
        return code;
    }
};

export const pageTypes = code => {
    if (
        !code.includes("/** @type {import('dibs-playwright').Page} */") &&
        code.includes('this.page')
    ) {
        code = code.replace(
            'this.page = page;',
            "/** @type {import('dibs-playwright').Page} */\n        this.page = page;"
        );
    }
    if (
        !code.includes("/** @type {(sel: string) => import('dibs-playwright').Locator} */") &&
        code.includes('this.locator')
    ) {
        code = code.replace(
            'this.locator = page.locator',
            "/** @type {import('dibs-playwright').Page['locator']} */\n        this.locator = page.locator"
        );
    }
    return code;
};
