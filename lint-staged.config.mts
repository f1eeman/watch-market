import type { Configuration } from 'lint-staged'

// Оборачиваем каждый файл в кавычки на случай пробелов в путях
const quote = (filenames: readonly string[]) =>
  filenames.map((f) => `'${f}'`).join(' ')

// Порядок команд внутри массива важен: сначала автофиксы линтеров, затем
// prettier — за форматирование отвечает только он и он же идёт последним.
// Типизацию здесь не проверяем: по одному файлу не виден остальной проект,
// поэтому `astro check` целиком по проекту вынесен в pre-push.
const config: Configuration = {
  '**/*.{js,mjs,ts,mts}': (filenames) => [
    `eslint --fix ${quote(filenames)}`,
    `prettier --write --ignore-unknown ${quote(filenames)}`,
  ],

  // В .astro и eslint (скрипты, разметка), и stylelint (блоки <style>)
  '**/*.astro': (filenames) => [
    `eslint --fix ${quote(filenames)}`,
    `stylelint --fix ${quote(filenames)}`,
    `prettier --write --ignore-unknown ${quote(filenames)}`,
  ],

  '**/*.css': (filenames) => [
    `stylelint --fix ${quote(filenames)}`,
    `prettier --write --ignore-unknown ${quote(filenames)}`,
  ],

  '**/*.{json,md,yml,yaml}': (filenames) =>
    `prettier --write --ignore-unknown ${quote(filenames)}`,
}

export default config
