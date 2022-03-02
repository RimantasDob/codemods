import { visit } from 'recast';

import visitors from './visitors';
import utils from '../../utils/utils';

// const files = '/Users/rimantas/projects/dibs-toho/mg/index.js';
// const files = '/Users/rimantas/projects/dibs-toho/mg/**/*.js';

export default () => {
    // const allFiles = utils.getAllFiles(files);
    // for (const filePath of allFiles) {
    //     console.log(filePath);
    //     const ast = utils.getAST(filePath);
    //     const visitor = visitors.getCallExpressionVisitor();
    //     visit(ast, visitor);
    //     utils.updateFile(filePath, ast);
    // }
};
