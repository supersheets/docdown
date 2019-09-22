const { parse } = require('./parser')
const { getDocProperties } = require('./props')

function markdown(doc, options) {
  options = options || { } 
  options.context = Object.assign(getDocProperties(doc), options.context || { })
  let parsed = parse(options.content || doc, options)
  return parsed.md
}

module.exports = {
  markdown
}
