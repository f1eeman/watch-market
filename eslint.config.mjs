import js from '@eslint/js'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginAstro from 'eslint-plugin-astro'
import { createNodeResolver, importX } from 'eslint-plugin-import-x'
import globals from 'globals'
import eslintTS from 'typescript-eslint'

const codeFiles = ['**/*.{js,mjs,ts,astro,mts}']

const tsFiles = ['**/*.{js,mjs,ts,mts}']

const astroFiles = ['**/*.astro']

const extraFileExtensions = ['.astro']

const typedParserOptions = {
  projectService: true,
  tsconfigRootDir: import.meta.dirname,
  extraFileExtensions,
}

export default [
  {
    ignores: ['dist', '.astro', 'node_modules', 'public'],
  },
  js.configs.recommended,
  ...eslintTS.configs.recommendedTypeChecked,
  ...eslintPluginAstro.configs.recommended,
  ...eslintPluginAstro.configs['jsx-a11y-recommended'],
  { ...importX.flatConfigs.recommended, files: codeFiles },
  { ...importX.flatConfigs.typescript, files: codeFiles },
  {
    settings: {
      'import-x/parsers': {
        espree: ['.js', '.mjs'],
        '@typescript-eslint/parser': ['.ts', '.mts'],
      },
      'import-x/ignore': ['\\.astro$'],
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ alwaysTryTypes: true }),
        createNodeResolver(),
      ],
    },
  },
  {
    files: codeFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: false,
        },
      ],
      'import-x/no-unresolved': ['error', { ignore: ['^astro:'] }],
      'no-irregular-whitespace': ['error', { skipJSXText: true }],
    },
  },
  {
    files: tsFiles,
    languageOptions: { parserOptions: typedParserOptions },
  },
  {
    files: astroFiles,
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions,
        parser: eslintTS.parser,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      'astro/jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['group', 'tabpanel'], allowExpressionValues: true },
      ],
    },
  },
  {
    files: ['*.config.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'import-x/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    ...eslintTS.configs.disableTypeChecked,
  },
  eslintConfigPrettier,
]
