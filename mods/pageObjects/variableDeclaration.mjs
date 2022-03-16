import { types } from 'recast';
import { resolve } from 'path';

const builders = types.builders;

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

export default (path, filePath, imports) => {
    let className = '';
    const body = path.node.body.map(node => {
        if (node?.declarations?.[0].init?.callee?.name === 'require') {
            const modulePath = node.declarations[0].init.arguments[0].value;
            const { moduleName, absolutePath } = getModuleData(modulePath, filePath);
            if (node.declarations[0].id.name && absolutePath.includes('pageObjects')) {
                imports.push({
                    past: node.declarations[0].id.name,
                    future: moduleName.charAt(0).toLowerCase() + moduleName.slice(1),
                    moduleName,
                });
                node.declarations[0].id.name = moduleName;
            }
            return node;
        } else if (node.type === 'ClassDeclaration') {
            className = node.id.name;
            return node;
        } else if (
            node.type === 'ExpressionStatement' &&
            className &&
            filePath.includes('pageObjects')
        ) {
            return builders.expressionStatement(
                builders.assignmentExpression(
                    '=',
                    builders.memberExpression(
                        builders.identifier('module'),
                        builders.identifier('exports')
                    ),
                    builders.identifier(className)
                )
            );
        } else {
            return node;
        }
    });
    path.node.body = body;
};
