export default oldCode => {
    const code = oldCode
        .replace(/\(\n\s+{\n\s+page\n\s+}\n\s+\)/g, '({ page })')
        .replace(/\n\s+page\n\s+/g, ' page ')
        .replace(/(?<=\(\{\spage\s\}\);)\n+/g, '\n')
        .replace(/(?<=super\(\{\spage\s\}\);)/g, '\n')
        .replace(/(?<=\(\{\spage\s\}\);)\n(?=\s+this\.selectors)/g, '\n\n');
    return code;
};
