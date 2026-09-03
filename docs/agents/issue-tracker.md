# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Each issue links to its PRD on a `PRD:` line right under `Status:`
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Три задачи велись без файла

`.scratch/` — не полный список сделанного. Три разбора приняты и закоммичены, а
папки задачи под ними нет:

| Разбор                                       | Что сделано                         |
| -------------------------------------------- | ----------------------------------- |
| `docs/adr/0015-analytics-tab-switch.md`      | такт переключения вкладок аналитики |
| `docs/adr/0017-questions-accordion-tempo.md` | такт аккордеона и знак из палочек   |
| `docs/adr/0019-plates-categories-sweep.md`   | проход по категориям нарушителей    |

Задним числом эти файлы не заводились намеренно: PRD в этом проекте — запись
допроса, то есть какие варианты рассматривались и чем оплачен выбор. Сочинить её
после факта значит выдать за состоявшийся разговор то, чего не было. Всё, что
известно про эти три задачи, лежит в самих разборах, и искать надо там.

Из этого следует практическое: **на вопрос «делали ли уже такое» отвечает
`docs/adr/`, а не `.scratch/`.** Каталог задач полон только с той стороны, что
каждая папка соответствует настоящей работе, — но не наоборот.
