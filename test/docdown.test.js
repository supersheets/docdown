require('dotenv').config()
const path = require('path')
const fs = require("fs")
const { markdown } = require('../lib/docdown')
//const { parse } = require('../lib/parser')

describe('Blockquotes', () => {
  let doc = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('blockquotes.google.json'))
  })
  it ('should render blockquotes', async () => {
    let md = markdown(doc)
    writefile('blockquotes.output.md', md)
    let expected = readfile('blockquotes.md')
    expect(md).toEqual(expected)
  })
})

describe('Headings', () => {
  let doc = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('headings.google.json'))
  })
  it ('should render headings', async () => {
    let md = markdown(doc)
    writefile('headings.output.md', md)
    let expected = readfile('headings.md')
    expect(md).toEqual(expected)
  })
})

describe('Text Formats', () => {
  let doc = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('textformats.google.json'))
  })
  it ('should render headings', async () => {
    let md = markdown(doc)
    writefile('textformats.output.md', md)
    let expected = readfile('textformats.md')
    expect(md).toEqual(expected)
  })
})

describe('Lists', () => {
  let doc = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('lists.google.json'))
  })
  it ('should render lists', async () => {
    let md = markdown(doc)
    writefile('lists.output.md', md)
    let expected = readfile('lists.md')
    expect(md).toEqual(expected)
  })
})

describe('Images', () => {
  let doc = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('images.google.json'))
  })
  it ('should render images', async () => {
    let md = markdown(doc)
    writefile('images.output.md', md)
    let expected = readfile('images.md')
    expect(md).toEqual(expected)
  })
})

describe('Subcontent', () => {
  let doc = null
  let content = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('subcontent.google.json'))
    content = JSON.parse(readfile('subcontent.inner.google.json'))
  })
  it ('should render sub content passed in as an option', async () => {
    let md = markdown(doc, { content })
    writefile('subcontent.output.md', md)
    let expected = readfile('subcontent.md')
    expect(md).toEqual(expected)
  })
})

function readfile(name) {
  return fs.readFileSync(path.join(__dirname, 'files', name)).toString('utf8')
}

function writefile(name, data) {
  fs.writeFileSync(path.join(__dirname, 'files', name), data)
}