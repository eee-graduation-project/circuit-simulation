import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import airbnbBaseRules from 'eslint-config-airbnb-base/rules/es6';
import airbnbBestPractices from 'eslint-config-airbnb-base/rules/best-practices';
import airbnbErrors from 'eslint-config-airbnb-base/rules/errors';
import airbnbStyle from 'eslint-config-airbnb-base/rules/style';
import airbnbReactRules from 'eslint-config-airbnb/rules/react';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,jsx}'],
        languageOptions: {
            globals: globals.browser,
        },
    },
    pluginJs.configs.recommended,
    {
        rules: {
            ...airbnbBaseRules.rules,
            ...airbnbBestPractices.rules,
            ...airbnbErrors.rules,
            ...airbnbStyle.rules,
            ...airbnbReactRules.rules,
        },
    },
    pluginReact.configs.flat.recommended,
    {
        plugins: {
            prettier: pluginPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },
    configPrettier,
];
