import fs from 'fs';
import glob from 'glob';

const getAllFilePaths = () => glob.sync('/Users/rimantas/projects/dibs-toho/mg/tests/**/*_spec.js');

const addDisableRule = (file: string): string => {
    const content = fs.readFileSync(file).toString();
    const splited = content.split('\n');
    const lines = ['/* eslint-disable toho/no-it-without-zephyr-link */', ...splited];
    return lines.join('\n');
};

const main = () => {
    const allFiles = getAllFilePaths();
    for (const file of allFiles) {
        console.log(file);
        const content = addDisableRule(file);
        fs.writeFileSync(file, content);
    }
};

main();
