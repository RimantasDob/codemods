import { print, visit } from 'recast';

import addStuff, { pageTypes } from './comments/addStuff.mjs';
import addVarDeclarations from './comments/addVarDeclarations.mjs';
import importVisitor from './visitors/importVisitor.mjs';
import loginViaUIVisitor from './visitors/loginViaUIVisitor.mjs';
import pageObjectVisitors from './visitors/pageObjectVisitors.mjs';
import specVisitors from './visitors/specVisitors.mjs';
import newSpecVisitors from './visitors/newSpecVisitors.mjs';
import spinnerVisitors from './visitors/spinnerVisitor.mjs';
import helperVisitor from './visitors/helperVisitor.mjs';
import testVisitor from './visitors/testVisitor.mjs';

import { getRelativePath } from './actions/variableDeclaration.mjs';

import commentOut from './comments/commentOut.mjs';
import updateConstructor from './comments/updateConstructor.mjs';
import replace from './comments/replace.mjs';
import utils from '../../utils/utils.mjs';
import filterOutLine from './comments/filterOutLine.mjs';

const fileList = [
    '/Users/rimantas/projects/dibs-toho/mg/**/*.js',
    '/Users/rimantas/projects/dibs-toho/mg/tests/ItemQuantity.spec.js',
];
const files = fileList[0];

const exec1 = false;
const exec2 = false;
const exec3 = false;
const exec4 = false;
const exec5 = false;
const exec6 = false;
const exec7 = false;
const exec8 = false;
const exec9 = false;
const exec10 = true;

export default file => {
    const allFiles = utils.getAllFiles(file || files);
    // Updates old pageObjects
    if (exec1) {
        const pageObjectFiles = allFiles.filter(
            filePath => filePath.includes('pageObjects') && !filePath.includes('iOS')
        );
        for (const filePath of pageObjectFiles) {
            console.log(filePath);
            let code = utils.getFile(filePath);
            code = commentOut(code);
            const ast = utils.getAST(code);
            const astVisitors = pageObjectVisitors.getVisitors(filePath);
            visit(ast, astVisitors);
            code = updateConstructor(print(ast).code);
            utils.updateFile(filePath, code);
        }
    }
    // Updates old spec files
    if (exec2) {
        const specFiles = allFiles.filter(
            filePath => filePath.includes('.spec.js') && !filePath.includes('iOS')
        );
        for (const filePath of specFiles) {
            console.log(filePath);
            let oldCode = utils.getFile(filePath);
            const savedCode = oldCode.split('\n').join('\n');
            oldCode = addStuff(oldCode);
            oldCode = commentOut(oldCode);
            oldCode = filterOutLine(oldCode);
            const ast = utils.getAST(oldCode);
            const astVisitors = specVisitors.getVisitors(filePath);
            visit(ast, astVisitors);
            const imports = specVisitors.getImports();
            console.log(imports);
            let code = print(ast).code;
            const navigateHelper = imports.filter(imp => imp.moduleName === 'Navigate')?.[0]
                ?.relativePath;
            const spinnerHelper = imports.filter(imp => imp.moduleName === 'Spinner')?.[0]
                ?.relativePath;
            code = replace(code, { navigateHelper, spinnerHelper });
            code = addVarDeclarations(code, imports);
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    // Adds page, locator type cast to constructor
    if (exec3) {
        const specFiles = allFiles.filter(filePath => !filePath.includes('iOS'));
        for (const filePath of specFiles) {
            console.log(filePath);
            let oldCode = utils.getFile(filePath);
            const savedCode = oldCode.split('\n').join('\n');
            const code = pageTypes(oldCode);
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    // Updates NavigateHelper, SpinnerHelper in pageObjects
    if (exec4) {
        const pageObjectFiles = allFiles.filter(
            filePath => filePath.includes('pageObjects') && !filePath.includes('iOS')
        );
        for (const filePath of pageObjectFiles) {
            console.log(filePath);
            let code = utils.getFile(filePath);
            const savedCode = code.split('\n').join('\n');
            const ast = utils.getAST(code);
            const astVisitors = importVisitor.getVisitors(filePath);
            visit(ast, astVisitors);
            code = updateConstructor(print(ast).code);
            const imports = importVisitor.getImports();
            const navigateHelper = imports.filter(imp => imp.moduleName === 'Navigate')?.[0]
                ?.relativePath;
            const spinnerHelper = imports.filter(imp => imp.moduleName === 'Spinner')?.[0]
                ?.relativePath;
            code = replace(code, { navigateHelper, spinnerHelper });
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    // Updates NavigateHelper, spinnerHelper in spec files
    if (exec5) {
        const specFiles = allFiles.filter(
            filePath => filePath.includes('pageObjects') && !filePath.includes('iOS')
        );
        for (const filePath of specFiles) {
            console.log(filePath);
            let before = utils.getFile(filePath);
            const savedCode = before.split('\n').join('\n');
            before = filterOutLine(before);
            const ast = utils.getAST(before);
            const astVisitors = newSpecVisitors.getVisitors(filePath);
            visit(ast, astVisitors);
            const code = print(ast).code;
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    //Updates specfiles and adds AuthModal import
    if (exec6) {
        const specFiles = allFiles.filter(
            filePath => filePath.includes('.spec.js') && !filePath.includes('iOS')
        );
        for (const filePath of specFiles) {
            console.log(filePath);
            let before = utils.getFile(filePath);
            const savedCode = before.split('\n').join('\n');
            const ast = utils.getAST(before);
            const astVisitors = loginViaUIVisitor.getVisitors(filePath);
            visit(ast, astVisitors);
            const imports = loginViaUIVisitor.getImports();
            let code = print(ast).code;
            code = addVarDeclarations(code, imports);
            code = replace(code, { beforeEach: true });
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    // handleLoading spinner
    if (exec7) {
        // const specFiles1 = allFiles.filter(
        //     filePath => filePath.includes('pageObject') && !filePath.includes('iOS') && false
        // );
        // for (const filePath of specFiles1) {
        //     console.log(filePath);
        //     let before = utils.getFile(filePath);
        //     const spinner = before.includes('handleLoadingSpinner');
        //     const navigate = before.includes('navigateToPage');
        //     const savedCode = before.split('\n').join('\n');
        //     const ast = utils.getAST(before);
        //     const astVisitors = spinnerVisitors.getVisitors(filePath, { spinner, navigate });
        //     visit(ast, astVisitors);
        //     const imports = spinnerVisitors.getImports();
        //     let code = print(ast).code;
        //     code = addVarDeclarations(code, imports);
        //     code = replace(code, { beforeEach: true });
        //     utils.updateFile(filePath, code);
        //     utils.prettier(filePath, savedCode, code);
        // }
        const specFiles2 = allFiles.filter(
            filePath =>
                filePath.includes('.spec.js') &&
                !filePath.includes('iOS') &&
                !filePath.includes('Cache')
        );
        for (const filePath of specFiles2) {
            console.log(filePath);
            let before = utils.getFile(filePath);
            const spinner = before.includes('handleLoadingSpinner');
            const navigate = before.includes('navigateToPage');
            const savedCode = before.split('\n').join('\n');
            const ast = utils.getAST(before);
            const astVisitors = spinnerVisitors.getVisitors(filePath, { spinner, navigate });
            visit(ast, astVisitors);
            const imports = spinnerVisitors.getImports();
            let code = print(ast).code;
            code = addVarDeclarations(code, imports);
            code = replace(code, { beforeEach: true });
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    //add page to test
    if (exec8) {
        const specFiles2 = allFiles.filter(
            filePath =>
                filePath.includes('.spec.js') &&
                !filePath.includes('iOS') &&
                !filePath.includes('Cache')
        );
        for (const filePath of specFiles2) {
            console.log(filePath);
            let before = utils.getFile(filePath);
            const savedCode = before.split('\n').join('\n');
            const ast = utils.getAST(before);
            const astVisitors = testVisitor.getVisitors();
            visit(ast, astVisitors);
            let code = print(ast).code;
            utils.updateFile(filePath, code);
            utils.prettier(filePath, savedCode, code);
        }
    }
    //setComLogin
    if (exec9) {
        const specFiles2 = allFiles.filter(
            filePath =>
                filePath.includes('.spec.js') &&
                !filePath.includes('iOS') &&
                !filePath.includes('Cache')
        );
        for (const filePath of specFiles2) {
            console.log(filePath);

            const helperPath = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/utils/Cookies.ts';
            const relativePath = getRelativePath(filePath, helperPath);
            const helper = {
                filterOutLine: "loginCookieHelper');",
                past: 'loginCookieHelper',
                newName: 'cookies',
                future: 'Cookies',
                moduleName: 'Cookies',
                relativePath,
                comment: `/** @type {import('${relativePath}').default} */`,
            };

            let before = utils.getFile(filePath);
            const savedCode = before.split('\n').join('\n');
            const hasHelper = savedCode.includes('setComLogin');
            if (hasHelper) {
                before = before
                    .split('\n')
                    .filter(line => !line.includes(helper.filterOutLine))
                    .join('\n');
                const ast = utils.getAST(before);
                const astVisitors = helperVisitor.getVisitors(filePath, helper);
                visit(ast, astVisitors);
                let code = print(ast).code;
                code = addVarDeclarations(code, [helper]);
                code = replace(code, { beforeEach: true });
                utils.updateFile(filePath, code);
                utils.prettier(filePath, savedCode, code);
            }
        }
    }
    if (exec10) {
        for (const filePath of allFiles) {
            const before = utils.getFile(filePath);
            if (before.includes('{ page }')) {
                console.log(filePath);
                const code = before
                    .split('\n')
                    .map(line => {
                        if (/new\s\w+\({\spage\s}\)/.test(line)) {
                            return line.replace('{ page }', 'page');
                        } else {
                            return line;
                        }
                    })
                    .join('\n');
                utils.updateFile(filePath, code);
                utils.prettier(filePath, before, code);
            }
        }
    }
};
