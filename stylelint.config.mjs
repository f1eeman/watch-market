/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-html/astro'],
  ignoreFiles: ['dist/**', '.astro/**', 'node_modules/**', 'public/**'],
  rules: {
    'number-max-precision': 5,
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'import-notation': null,
  },
}
