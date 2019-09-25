const { JSONPath } = require('jsonpath-plus')

module.exports = {
  parse
}

function parse(json, options) {
  options = options || { }
  let path = options.path || '$..paragraph'
  let context = options.context || { lists: { }, images: { } }
  let blocks = JSONPath({ path, json }).map(paragraph => parseBlocks(paragraph, context, options))
  let rendered = render(blocks, context, options)
  return rendered
}

function render(blocks, context, options) {
  let md = ""
  blocks.forEach(block => {
    let b = renderBlock(block, context, options)
    let inlines = block.inlines.map(inline => renderInline(inline, context, options))
    let inlinestr = stripLeadingTabs(inlines.join(''))
    if (b) {
      md += `${b} ${inlinestr}`
    } else {
      md += inlinestr
    }
  })
  return { md, blocks}
}

function parseBlocks({ elements, paragraphStyle, bullet, horizontalRule }, context, options) {
  let inlines = elements.map(el => parseInline(el))
  let text = JSONPath({ path: "$..textRun.content", json: { elements } }).join()
  let indent = JSONPath({ path: "$..indentStart.magnitude", json: paragraphStyle })[0] || 0
  let tabs = countLeadingTabs(text)
  let level = (indent / 36) + tabs
  let header = paragraphStyle.namedStyleType && GOOGLE_HEADER_TYPES.includes(paragraphStyle.namedStyleType) && paragraphStyle.namedStyleType || false
  let list = bullet && bullet.listId && { id: bullet.listId, level: bullet.nestingLevel } || false
  let hr = inlines.length == 2 && inlines[0].hr && inlines[1].text == "\n" && true || false
  let end = text === "\n"
  return {
    inlines,
    text,
    props: {
      indent,
      tabs,
      level,
      header,
      list,
      hr,
      end
    }
  }
}

function parseInline({ textRun, horizontalRule, inlineObjectElement }) {
  textRun = textRun || { }
  let text = textRun.content
  let bold = textRun.textStyle && textRun.textStyle.bold || false
  let italic = textRun.textStyle && textRun.textStyle.italic || false
  let link = textRun.textStyle && textRun.textStyle.link && textRun.textStyle.link.url || false
  let image = inlineObjectElement && inlineObjectElement.inlineObjectId || false
  let strikethrough = textRun.textStyle && textRun.textStyle.strikethrough || false
  let hr = horizontalRule || false
  return {
    text,
    props: {
      bold, 
      italic,
      strikethrough,
      link,
      image,
      hr
    }
  }
}


function renderBlock(block, context) {
  let props = block.props
  let line = [ ]
  if (props.hr) {
    line.push("---")
    return line.join(' ')
  }
  if (props.level) {
    line.push(renderBlockquote(block))
  }
  if (props.list) {
    line.push(renderList(block, context))
  }
  if (props.header) {
    line.push(renderHeader(block))
  }
  if (props.end) {
    line.push(renderEnd(block))
  }
  block.md = line.join(' ')
  return block.md
}

function renderBlockquote(block) {
  let level = block.props.level
  if (block.props.list) {
    let listlevel = block.props.list.level || 0
    level = level - listlevel - 1
  }
  if (block.tabs == 1) console.log(JSON.stringify(block, null, 2))
  return `${">".repeat(level)}`
}

function renderList(block, context) {
  let listid = block.props.list.id
  let level = block.props.list.level
  let props = context.lists[listid]
  let symbol = "-"
  if (props.type == "NUMBERED") {
    symbol = "1."
  }
  let spaces = level > 0 &&  " ".repeat(level * 4) || ''
  return `${spaces}${symbol}`
}

const GOOGLE_HEADER_TYPES = [
  "TITLE", "SUBTITLE",
  "HEADING_1", "HEADING_2", "HEADING_3", 
  "HEADING_4", "HEADING_5", "HEADING_6"
]

function renderHeader(block, context) {
  let level = 0
  switch(block.props.header) {
    case "TITLE": 
      level = 1
      break
    case "SUBTITLE": 
      level = 2
      break
    case "HEADING_1":
      level = 1
      break
    case "HEADING_2":
      level = 2
      break
    case "HEADING_3":
      level = 3
      break
    case "HEADING_4":
      level = 4
      break
    case "HEADING_5":
      level = 5
      break
    case "HEADING_6": 
      level = 6
      break
  }
  return "#".repeat(level)
}

function renderEnd(block, context) {
  // return '\n'
  // we don't need to return this because the inline elements
  // already have '\n'
  return ''
}

function renderInline(inline, { images }) {
  let text = inline.text
  let props = inline.props
  let line = ''
  if (props.image) {
    let image = images[props.image]
    let alt = ''
    line = `![${alt}](${image.uri})`
  } else if (props.link) {
    line = `[${text}](${props.link})`
  } else if (text) {
    line = text
  }
  if (props.italic) {
    line = wrapNonWhitespace(line, "_")
  }
  if (props.bold) {
    line = wrapNonWhitespace(line, "**")
  }
  if (props.strikethrough) {
    line = wrapNonWhitespace(line, "~~")
  }
  inline.md = line
  return line
}

function wrapNonWhitespace(str, left, right) {
  if (!right) right = left
  leadwhitespace = /^\s*/
  trailwhitespace = /\s*$/
  let i = str.match(leadwhitespace)[0].length
  let j = str.match(trailwhitespace)[0].length
  let wsleft = str.substring(0, i)
  let wsright = str.substring(str.length-j)
  return `${wsleft}${left}${str.substring(i, str.length-j)}${right}${wsright}`
} 

function countLeadingTabs(line) {
  let tabs = 0
  for (let i = 0; i<line.length; i++) {
    if (line.charAt(i) != '\t') {
      break
    } 
    tabs += 1
  }
  return tabs
}

function stripLeadingTabs(line) {
  let tabs = 0
  for (let i = 0; i<line.length; i++) {
    if (line.charAt(i) != '\t') {
      break
    } 
    tabs += 1
  }
  return line.substring(tabs)
}

function getDocListProperties(doc) {
  lists = { }
  if (!doc.lists) return lists
  for (let key in doc.lists) {
    let props = doc.lists[key].listProperties.nestingLevels[0]
    if (props.glyphType == "DECIMAL") {
      lists[key] = {
        type: "NUMBERED"
      }
    } else {
      lists[key] = {
        type: "BULLET"
      }
    }
  }
  return lists
}

function getDocImageProperties(doc) {
  images = { }
  if (!doc.inlineObjects) return images
  for (let key in doc.inlineObjects) {
    let props = doc.inlineObjects[key]
    let uri = JSONPath({json: props, path: '$..contentUri'})[0]
    let h = JSONPath({json: props, path: '$..height.magnitude'})[0]
    let w = JSONPath({json: props, path: '$..width.magnitude'})[0]
    images[key] = { uri, h, w }
  }
  return images
}