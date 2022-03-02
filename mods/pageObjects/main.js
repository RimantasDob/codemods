import { visit } from 'recast';

import visitors from './visitors';
import utils from '../../utils/utils';

const files = '/Users/rimantas/projects/dibs-toho/mg/pageObjects/1stdibs.com/AccountInfo.js';
// const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

export default () => {
    const allFiles = utils.getAllFiles(files);
    for (const filePath of allFiles) {
        const ast = utils.getAST(filePath);
        const visitor = visitors.getClassMethodVisitor();
        console.log(visitor);
        visit(ast, visitor);
        // utils.updateFile(filePath, ast);
    }
};
