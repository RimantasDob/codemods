export default code =>
    code
        .split('\n')
        .filter(line => !line.includes('const basePageObject = new BasePageObject()'))
        .join('\n');
