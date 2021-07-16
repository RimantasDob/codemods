"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const getAllFilePaths = () => glob_1.default.sync('/Users/rimantas/projects/dibs-toho/mg/tests/**/*_spec.js');
const addDisableRule = (file) => {
    const content = fs_1.default.readFileSync(file).toString();
    const splited = content.split('\n');
    const lines = ['/* eslint-disable toho/no-it-without-zephyr-link */', ...splited];
    return lines.join('\n');
};
const main = () => {
    const allFiles = getAllFilePaths();
    for (const file of allFiles) {
        console.log(file);
        const content = addDisableRule(file);
        fs_1.default.writeFileSync(file, content);
    }
};
main();
