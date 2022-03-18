export default oldCode => {
    const code = oldCode.replace(/this\.page/g, 'page').replace(/this\.locator/g, 'page.locator');
    return code;
};
