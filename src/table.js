
/**
 * Get all boolean input values for n variables.
 *
 * @example
 * // [ [ true, true ], [ true, false ], [ false, true ], [ false, false ] ]
 * getValues(2, [])
 *
 * @param   {Number} n - The number of variables.
 * @param   {Array} t - The array to be recursively filled.
 *
 * @returns {Array} All possible input values.
 */
function getValues (n, t) {
  if (t.length === n) {
    return [t]
  } else {
    return getValues(n, t.concat(true)).concat(getValues(n, t.concat(false)))
  }
}

/**
 * Get all boolean values for each variable.
 *
 * @example
 * // [ { P: true }, { P: false } ]
 * getCases (['P'])
 *
 * @param   {Array} variables - All variables in a given statement.
 *
 * @returns {Array} - An array of objects mapping variables to their possible
 *  values.
 */
function getCases (variables) {
  var numVars = variables.length
  var values = getValues(numVars, [])
  var numRows = values.length
  var rows = []
  var row = {}

  for (var i = 0; i < numRows; ++i) {
    row = {}
    for (var j = 0; j < numVars; ++j) {
      row[variables[j]] = values[i][j]
    }
    rows.push(row)
  }

  return rows
}

/**
 * Convert a statement into an object representing the structure of a table.
 *
 * @param   {Object} s - The statement to be converted.
 *
 * @returns {Object} - The table representation.
 */
function statementToTable (s) {
  var table = {}

  table['statement'] = s.statement
  table['variables'] = s.variables
  table['rows'] = getCases(table['variables'])
  for (var i = 0; i < table['rows'].length; ++i) {
    table['rows'][i]['eval'] = s.evaluate(table['rows'][i])
  }

  return table
}

/**
 * Create a Markdown-formatted truth table.
 *
 * @param   {Object} table - The table to be converted to Markdown.
 *
 * @returns {String} The Markdown-formatted table.
 */
function tableToMarkdown (table) {
  var rows = []
  var row = []
  var header = table['variables'].slice()

  header.push(table['statement'].replace(/\|/g, '&#124;'))
  rows.push(header)
  for (var i = 0; i < table['rows'].length; ++i) {
    row = []
    for (var j = 0; j < table['variables'].length; ++j) {
      row.push(table['rows'][i][table['variables'][j]])
    }
    row.push(table['rows'][i]['eval'])
    rows.push(row)
  }

  return toMarkdown(rows)
}

/**
 * Render rows as a centre-aligned Markdown table.
 *
 * Written out rather than pulled from `markdown-table`: it was the library's
 * only runtime dependency, and a propositional-logic package having none at all
 * is worth twenty lines.
 *
 * @param   {Array} rows - Header row first, then body rows.
 *
 * @returns {String} The Markdown-formatted table.
 */
function toMarkdown (rows) {
  const cells = rows.map(function (row) {
    return row.map(String)
  })
  const widths = cells[0].map(function (_, i) {
    return Math.max.apply(null, cells.map(function (row) {
      return row[i].length
    }).concat(3))
  })

  const line = function (row) {
    return '| ' + row.map(function (cell, i) {
      const pad = widths[i] - cell.length
      // Extra space goes left, matching what markdown-table produced so the
      // output documented in the README stays byte-identical.
      const left = Math.ceil(pad / 2)
      return ' '.repeat(left) + cell + ' '.repeat(pad - left)
    }).join(' | ') + ' |'
  }

  const rule = '| ' + widths.map(function (w) {
    return ':' + '-'.repeat(w - 2) + ':'
  }).join(' | ') + ' |'

  return [line(cells[0]), rule].concat(cells.slice(1).map(line)).join('\n')
}

/**
 * Create a truth table from a given statement.
 *
 * @param   {String} s - The statement.
 * @param   {String} type - The table format.
 *
 * @returns {String} - The formatted table.
 */
function makeTruthTable (s, type) {
  var table = statementToTable(s)
  var format = type.toLowerCase()

  // TODO: Add support for other formats
  switch (format) {
    case 'markdown':
      return tableToMarkdown(table)
  }
}

// module.exports.truthTable = makeTruthTable
export default makeTruthTable
