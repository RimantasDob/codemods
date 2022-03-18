export default code => {
    if (!code.includes('@ts-check')) {
        return ['// @ts-check', code].join('\n');
    } else {
        return code;
    }
};
