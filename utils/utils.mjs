import babel from '@babel/parser';
import fs from 'fs';
import glob from 'glob';
import { parse } from 'recast';

const isPrimitive = val => {
    return val === null || /^[sbn]/.test(typeof val);
};

export const looksLike = (node, patternObj) => {
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
                    : looksLike(nodeVal, patternVal);
            }
        })
    );
};

export default {
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
    updateFile(oldPath, code) {
        const newPath = oldPath.replace(/_spec/, '.spec').replace(/\.js$/g, '.mjs');
        fs.renameSync(oldPath, newPath);
        fs.writeFileSync(newPath, code);
    },
};
