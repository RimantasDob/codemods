import { print, visit } from 'recast';

import visitors from './visitors.mjs';
import updateConstructor from './updateConstructor.mjs';
import utils from '../../utils/utils.mjs';

const files = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/1stdibs.com/buyerOMT/BuyerOMT.js';
// const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

export default () => {
    const allFiles = utils.getAllFiles(files).filter(filePath => filePath.includes('pageObjects'));
    for (const filePath of allFiles) {
        console.log(filePath);
        const ast = utils.getAST(filePath);
        const astVisitors = visitors.getVisitors(filePath);
        visit(ast, astVisitors);
        const code = updateConstructor(print(ast).code);
        utils.updateFile(filePath, code);
    }
};
