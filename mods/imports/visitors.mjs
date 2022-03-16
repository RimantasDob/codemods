import { types } from 'recast';
import { resolve } from 'path';
import { looksLike } from '../../utils/utils.mjs';

const builders = types.builders;

const imports = [];

const getImported = (node, moduleName) => {
    const defaultImport = !!node.declarations[0].id.name;
    if (defaultImport) {
        return [builders.importDefaultSpecifier(builders.identifier(moduleName))];
    } else {
        const names = node.declarations[0].id.properties.map(val => val.key.name);
        return names.map(val => builders.importSpecifier(builders.identifier(val)));
    }
};

const getModuleData = (modulePath, filePath) => {
    if (modulePath.includes('/')) {
        const pathSplit = modulePath.split('/');
        const moduleName = pathSplit[pathSplit.length - 1];
        const absolutePath = resolve(filePath.replace(/\w+\.js$/g, '') + modulePath);
        return { moduleName, absolutePath };
    } else {
        return { moduleName: modulePath, absolutePath: modulePath };
    }
};

const updateVariableDeclaration = (path, filePath) => {
    let className = '';
    const body = path.node.body.map(node => {
        if (node?.declarations?.[0].init?.callee?.name === 'require') {
            const modulePath = node.declarations[0].init.arguments[0].value;
            const { moduleName, absolutePath } = getModuleData(modulePath, filePath);
            if (absolutePath.includes('pageObjects')) {
                console.log(node.declarations[0].id.name);
                const future = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
                imports.push({
                    past: node.declarations[0].id.name,
                    future,
                    moduleName,
                });
            }
            const stuff = getImported(node, moduleName);
            return builders.importDeclaration(stuff, builders.literal(modulePath));
        } else if (node.type === 'ClassDeclaration') {
            className = node.id.name;
            return node;
        } else if (node.type === 'ExpressionStatement') {
            return builders.exportDefaultDeclaration(builders.identifier(className));
        } else {
            return node;
        }
    });
    path.node.body = body;
};

const updateImports = node => {
    const calleeName = node.callee?.object.name;
    const calleeProperty = node.callee?.property.name;
    const { future } = imports.filter(val => val.past === calleeName)[0];
    node.callee = builders.memberExpression(
        builders.memberExpression(builders.thisExpression(), builders.identifier(future)),
        builders.identifier(calleeProperty)
    );
};

export default {
    getVisitors(filePath) {
        return {
            visitProgram(path) {
                updateVariableDeclaration(path, filePath);
                this.traverse(path);
            },
            visitMemberExpression(path) {
                const isImported = looksLike(path.node, {
                    callee: {
                        object: { name: name => imports.map(val => val.past).includes(name) },
                    },
                });
                if (isImported) {
                    updateImports(path.node);
                }
                this.traverse(path);
            },
        };
    },
};
