export default oldCode => {
    const code = oldCode.replace(/(?<=\s\s\s\s)(?=(await|return)\sbrowser.pause)/g, '// ');
    return code;
};
