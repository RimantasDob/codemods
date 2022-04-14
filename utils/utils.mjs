import babel from '@babel/parser';
import fs from 'fs';
import glob from 'glob';
import { parse, types } from 'recast';
import { execSync } from 'child_process';

const builders = types.builders;

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

const getParentNode = path => {
    const parent = path.parentPath;
    if (parent.node.type === 'Program') {
        return null;
    } else if (parent.node.type === 'CallExpression') {
        const isTest = looksLike(parent.node, { callee: { name: n => n === 'test' } });
        if (isTest) {
            return parent;
        } else {
            return getParentNode(parent);
        }
    } else {
        return getParentNode(parent);
    }
};

export const addPageToTest = path => {
    const parent = getParentNode(path);
    if (parent) {
        parent.node.arguments[1].params = [
            builders.objectPattern([
                {
                    type: 'ObjectProperty',
                    kind: 'init',
                    shorthand: true,
                    key: builders.identifier('page'),
                    value: builders.identifier('page'),
                },
            ]),
        ];
    }
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
    getFile(filePath) {
        return fs.readFileSync(filePath, { encoding: 'utf-8' });
    },
    getAST(code) {
        return parse(code, { parser: babel });
    },
    renameFile(oldPath, newPath) {
        fs.renameSync(oldPath, newPath);
    },
    updateFile(filePath, code) {
        fs.writeFileSync(filePath, code);
    },
    prettier(filePath, savedCode, code) {
        if (savedCode !== code) {
            execSync(`cd /Users/rimantas/projects/dibs-toho/mg && npx prettier ${filePath} --write`)
                .toString()
                .trim();
        }
    },
};
