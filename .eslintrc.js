module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 9,
        sourceType: 'module',
    },
    env: {
        browser: true,
    },
    // add your custom rules here
    rules: {
        /* Перенос элементов массива на новую строку */
        'array-element-newline': [ 'error', 'consistent', ],
        /* Перенос открывающей и закрывающей скобки массива на новую строку */
        'array-bracket-newline': [ 'error', 'consistent', ],
        /* Пробел после открывающей и перед закрывающей скобками массива */
        'array-bracket-spacing': [ 'error', 'always', ],
        /* Перенос открывающей и закрывающей скобки объекта на новую строку */
        'object-curly-newline': [ 'error', { 'consistent': true, }, ],
        /* Пробел после открывающей и перед закрывающей скобками объекта */
        'object-curly-spacing': [ 'error', 'always', ],
        /* Пробел перед вычисляемым названием свойства (напр. var x = {[ b ]: a}) */
        'computed-property-spacing': [ 'error', 'never', ],
        /* Обособление пробелами запятой */
        'comma-spacing': [ 'error', { 'before': false, 'after': true, }, ],
        /* Пробелы перед блоками */
        'space-before-blocks': [
            'error',
            {
                'functions': 'always',
                'keywords': 'always',
                'classes': 'always',
            },
        ],
        /* Точки с запятыми */
        'semi': [ 'error', 'never', ],
        /* Кавычки */
        'quotes': [
            2,
            'single',
            {
                'avoidEscape': true, /* можно например так: var a = 'вапвап "вапывап" цепрц' */
                'allowTemplateLiterals': true, /* Разрешены шаблонные литералы, напр. let с = `апыва ${templateVariable} впрвапр.` */
            },
        ],
        /* Запретить несколько пробелов подряд */
        'no-multi-spaces': [
            'error',
            {
                'ignoreEOLComments': true,
                'exceptions': { 'Property': true, },
            },
        ],
        /* Оформление скобками стрелочной функции, контролирует обособление входных параметров и тела функции */
        'arrow-parens': [ 'error', 'as-needed', ],
        /* Пробелы между звездочкой итератора и названием/объявлением функции function *generator() {yield "44"; yield "55";}*/
        'generator-star-spacing': [ 'error', { 'before': true, 'after': false, }, ],
        /* Отсутпы пробелами */
        'indent': [ 'error', 4, ],
        /* Отступ перед открывающей скобкой функции */
        'space-before-function-paren': [ 'error', { 'asyncArrow': 'always', }, ],
        /* Отступы между скобками и выражением внутри */
        'space-in-parens': [ 'error', 'never', ],
        /* Отступы перед двоеточием и после */
        'key-spacing': [
            'error',
            {
                'beforeColon': false,
                'afterColon': true,
            },
        ],
        /* Запятая после последнего элемента или свойства в объекте или массиве */
        'comma-dangle': [ 'error', 'always', ],
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    },
}
