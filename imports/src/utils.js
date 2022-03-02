const babel = require('@babel/parser');
const fs = require('fs');
const glob = require('glob');
const { parse, print } = require('recast');

const isPrimitive = val => {
    return val === null || /^[sbn]/.test(typeof val);
};

const _looksLike = (node, patternObj) => {
    return (
        !!node &&
        patternObj &&
        Object.keys(patternObj).every(bKey => {
            const patternVal = patternObj[bKey];
            const nodeVal = node[bKey];
            if (typeof patternVal === 'function') {
                return patternVal(nodeVal);
            } else {
                return isPrimitive(patternVal)
                    ? patternVal === nodeVal
                    : _looksLike(nodeVal, patternVal);
            }
        })
    );
};

module.exports = {
    getAllFiles(filePath) {
        return glob
            .sync(filePath)
            .filter(
                file =>
                    !(
                        file.includes('/extensions/') ||
                        file.includes('/node_modules/') ||
                        file.includes('/scripts/') ||
                        file.includes('/tmp/') ||
                        file.includes('/mg/index.js')
                    )
            );
    },
    getAST(filePath) {
        const code = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return parse(code, { parser: babel });
    },
    looksLike(node, patternObj) {
        return _looksLike(node, patternObj);
    },
    updateFile(filePath, ast) {
        const code = print(ast).code;
        fs.writeFileSync(filePath, code);
    },
};
