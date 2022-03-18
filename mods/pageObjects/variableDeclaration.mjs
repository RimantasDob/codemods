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
            if (
                node.declarations[0].id.name &&
                (absolutePath.includes('pageObjects') || absolutePath.includes('cache'))
            ) {
                const futureName = (
                    moduleName.charAt(0).toLowerCase() + moduleName.slice(1)
                ).replace(/^pDP/g, 'pdp');
                const future =
                    absolutePath.includes('mobile_web') && futureName === 'Search'
                        ? 'mwSearch'
                        : futureName;
                imports.push({
                    past: node.declarations[0].id.name,
                    future,
                    moduleName,
                    comment: `/** @type {import('${node.declarations[0].init.arguments[0].value}')} */`,
                });
                imports.sort((a, b) => (a.future > b.future ? 1 : -1));
                node.declarations[0].id.name = moduleName;
            } else if (
                absolutePath === 'dibs-wdio' &&
                node.declarations[0]?.id?.properties.some(
                    prop => prop?.value.name === 'BasePageObject'
                )
            ) {
                imports.push({
                    past: 'basePageObject',
                    future: 'basePageObject',
                    moduleName: 'BasePageObject',
                    comment: "/** @type {import('dibs-wdio').BasePageObject} */",
                });
                imports.sort((a, b) => (a.future > b.future ? 1 : -1));
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
