import { types } from 'recast';
import { resolve, relative } from 'path';

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

export const getRelativePath = (currentFilePath, importedFilePath) => {
    return relative(currentFilePath.replace(/(\w+\.)+(js|ts)$/g, ''), importedFilePath).replace(
        /\.ts$/,
        ''
    );
};
export const addHelper = (path, filePath, imports, helper) => {
    const body = path.node.body.map(node => {
        if (node?.declarations?.[0].init?.callee?.name === 'require') {
            const modulePath = node.declarations[0].init.arguments[0].value;
            const { moduleName, absolutePath } = getModuleData(modulePath, filePath);
            const className = node.declarations[0].id.name;
            if (className && absolutePath.includes('pageObjects')) {
                imports.push({
                    past: className,
                    future: className,
                    moduleName,
                    comment: `/** @type {import('${node.declarations[0].init.arguments[0].value}')} */`,
                });
            }
        }
        return node;
    });

    const add = !path.node.body.some(body => body?.declarations?.[0]?.id.name === helper.future);

    if (add) {
        body.unshift(
            builders.variableDeclaration('const', [
                builders.variableDeclarator(
                    builders.identifier(helper.future),
                    builders.memberExpression(
                        builders.callExpression(builders.identifier('require'), [
                            builders.stringLiteral(helper.relativePath),
                        ]),
                        builders.identifier('default')
                    )
                ),
            ])
        );
        imports.push(helper);
    }

    imports.sort((a, b) => (a.future > b.future ? 1 : -1));

    path.node.body = body;
};

export default (path, filePath, imports, { spinner, navigate } = {}) => {
    let className = '';
    const body = path.node.body.map(node => {
        if (node?.declarations?.[0].init?.callee?.name === 'require') {
            const modulePath = node.declarations[0].init.arguments[0].value;
            const { moduleName, absolutePath } = getModuleData(modulePath, filePath);
            if (absolutePath.includes('pageObjects/mobileWeb/search/Search')) {
                imports.push({
                    past: node.declarations[0].id.name,
                    future: 'mwSearch',
                    moduleName: 'MWSearch',
                    comment: `/** @type {import('${node.declarations[0].init.arguments[0].value}')} */`,
                });
            } else if (
                node.declarations[0].id.name &&
                (absolutePath.includes('pageObjects') || absolutePath.includes('cache'))
            ) {
                const future = (moduleName.charAt(0).toLowerCase() + moduleName.slice(1)).replace(
                    /^pDP/g,
                    'pdp'
                );
                imports.push({
                    past: node.declarations[0].id.name,
                    future,
                    moduleName,
                    comment: `/** @type {import('${node.declarations[0].init.arguments[0].value}')} */`,
                });
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
                    comment: "/** @type {import('dibs-playwright').BasePageObject} */",
                });
            } else if (absolutePath.includes('spinnerHelper')) {
                const spinnerPath =
                    '/Users/rimantas/projects/dibs-toho/mg/pageObjects/utils/Spinner';
                const relativePath = getRelativePath(filePath, spinnerPath);
                imports.push({
                    past: 'spinnerHelper',
                    future: 'spinner',
                    moduleName: 'Spinner',
                    comment: `/** @type {import('${relativePath}')} */`,
                    relativePath,
                });
            } else if (absolutePath.includes('navigateHelper')) {
                const navigatePath =
                    '/Users/rimantas/projects/dibs-toho/mg/pageObjects/utils/Navigate';
                const relativePath = getRelativePath(filePath, navigatePath);
                imports.push({
                    past: 'navigateHelper',
                    future: 'navigate',
                    moduleName: 'Navigate',
                    comment: `/** @type {import('${relativePath}')} */`,
                    relativePath,
                });
            } else if (absolutePath.includes('loginHelper')) {
                const authModal =
                    '/Users/rimantas/projects/dibs-toho/mg/pageObjects/1stdibs.com/AuthModal';
                const relativePath = getRelativePath(filePath, authModal);
                const alreadyImported = imports.some(
                    ({ moduleName }) => moduleName === 'AuthModal'
                );
                if (!alreadyImported) {
                    imports.push({
                        past: 'loginHelper',
                        future: 'authModal',
                        moduleName: 'AuthModal',
                        comment: `/** @type {import('${relativePath}')} */`,
                        relativePath,
                    });
                }
                node = alreadyImported
                    ? null
                    : builders.variableDeclaration('const', [
                          builders.variableDeclarator(
                              builders.identifier('AuthModal'),
                              builders.callExpression(builders.identifier('require'), [
                                  builders.stringLiteral(relativePath),
                              ])
                          ),
                      ]);
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
        }
        if (node?.declarations?.[0].init?.object?.callee?.name === 'require') {
            const modulePath = node.declarations[0].init.object.arguments[0].value;
            const { moduleName } = getModuleData(modulePath, filePath);
            const future = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
            if (future !== 'dibs-wdio') {
                imports.push({
                    past: node.declarations[0].id.name,
                    future,
                    moduleName,
                    comment: `/** @type {import('${node.declarations[0].init.object.arguments[0].value}').default} */`,
                });
            }
            return node;
        } else {
            return node;
        }
    });
    if (spinner && !imports.some(imp => imp.moduleName === 'Spinner')) {
        const spinnerPath = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/utils/Spinner.ts';
        const relativePath = getRelativePath(filePath, spinnerPath);
        const alreadyImported = imports.some(({ moduleName }) => moduleName === 'Spinner');
        if (!alreadyImported) {
            imports.push({
                past: 'page11',
                future: 'spinner',
                moduleName: 'Spinner',
                comment: `/** @type {import('${relativePath}').default} */`,
            });
        }
        body.unshift(
            builders.variableDeclaration('const', [
                builders.variableDeclarator(
                    builders.identifier('Spinner'),
                    builders.memberExpression(
                        builders.callExpression(builders.identifier('require'), [
                            builders.stringLiteral(relativePath),
                        ]),
                        builders.identifier('default')
                    )
                ),
            ])
        );
    }
    if (navigate && !imports.some(imp => imp.moduleName === 'Navigate')) {
        const spinnerPath = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/utils/Navigate.ts';
        const relativePath = getRelativePath(filePath, spinnerPath);
        const alreadyImported = imports.some(({ moduleName }) => moduleName === 'Navigate');
        if (!alreadyImported) {
            imports.push({
                past: 'page11',
                future: 'navigate',
                moduleName: 'Navigate',
                comment: `/** @type {import('${relativePath}').default} */`,
            });
        }
        body.unshift(
            builders.variableDeclaration('const', [
                builders.variableDeclarator(
                    builders.identifier('Navigate'),
                    builders.memberExpression(
                        builders.callExpression(builders.identifier('require'), [
                            builders.stringLiteral(relativePath),
                        ]),
                        builders.identifier('default')
                    )
                ),
            ])
        );
    }

    imports.sort((a, b) => (a.future > b.future ? 1 : -1));

    path.node.body = body;
};
