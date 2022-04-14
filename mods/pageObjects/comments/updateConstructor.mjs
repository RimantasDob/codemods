export default oldCode => {
    let code = oldCode
        .replace(/\(\n\s+{\n\s+page\n\s+}\n\s+\)/g, '({ page })')
        .replace(/\n\s+page\n\s+/g, ' page ')
        .replace(/(?<=\(\{\spage\s\}\);)\n+/g, '\n')
        .replace(/(?<=super\(\{\spage\s\}\);)/g, '\n')
        .replace(/(?<=\(\{\spage\s\}\);)\n(?=\s+this\.selectors)/g, '\n\n');
    const locatorCount = code.match(/this\.locator/g)?.length || 1;
    if (locatorCount <= 1) {
        code = code.replace(/\n\s+this\.locator\s=\spage\.locator\.bind\(page\);\n/, '\n');
    }
    const pageCount = code.match(/this\.page/g)?.length || 1;
    if (locatorCount <= 1 && pageCount <= 1) {
        code = code.replace(/\n\s+this\.page\s=\spage;\n/, '\n');
    }
    return code;
};
