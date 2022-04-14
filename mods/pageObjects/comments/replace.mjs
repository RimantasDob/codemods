export default (oldCode, { beforeEach, page } = {}) => {
    let code = oldCode;
    if (beforeEach) {
        code = code
            .replace(/{\n\s+page,?\n\s+}/g, '{ page }')
            .replace(/\({ page }\);\n/g, '({ page });');
    }
    if (page) {
        code = code.replace(/this\.page/g, 'page').replace(/this\.locator/g, 'page.locator');
    }
    return code;
};
