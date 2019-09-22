require('dotenv').config()
const path = require('path')
const fs = require("fs")
const { getDocProperties, getDocImageProperties, getDocListProperties } = require('../lib/props')

describe('getDocImageProperties', () => {
  it ('should return empty object if no image properties', async () => {
    let doc = JSON.parse(readfile('lists.google.json'))
    let props = getDocImageProperties(doc)
    expect(props).toEqual({})
  })
  it ('should extract image properties from a google doc', async () => {
    let doc = JSON.parse(readfile('images.google.json'))
    let props = getDocImageProperties(doc)
    expect(props).toEqual(  {
      "kix.43dzdg9ar9z2": {
        "uri": expect.anything(),
        "h": 165,
        "w": 165
      },
      "kix.ogbp3umx1b81": {
        "uri": expect.anything(),
        "h": 165,
        "w": 165
      },
      "kix.m9s651upq8gk": {
        "uri": expect.anything(),
        "h": 165,
        "w": 165
      }
    })
  })
})

describe('getDocListProperties', () => {
  it ('should return empty object if no list properties', async () => {
    let doc = JSON.parse(readfile('images.google.json'))
    let props = getDocListProperties(doc)
    expect(props).toEqual({})
  })
  it ('should extract list properties from a google doc', async () => {
    let doc = JSON.parse(readfile('lists.google.json'))
    let props = getDocListProperties(doc)
    expect(props).toEqual({
      "kix.5thngg846vpz": {
        "type": "BULLET"
      },
      "kix.f00b6r2hr7": {
        "type": "NUMBERED"
      },
      "kix.wi8kr6ou01to": {
        "type": "NUMBERED"
      },
      "kix.rdos8t4z2yax": {
        "type": "BULLET"
      },
      "kix.ywrx22m5p0su": {
        "type": "NUMBERED"
      },
      "kix.ecty6lkwzvvv": {
        "type": "NUMBERED"
      },
      "kix.r7g3lymm5j76": {
        "type": "BULLET"
      },
      "kix.ex7w80s88ph9": {
        "type": "BULLET"
      }
    })
  })
})

describe('getDocProperties', () => {
  let doc = null
  beforeAll(async () => {
    doc = JSON.parse(readfile('images.google.json'))
  })
  it ('should extract both list and image properties', async () => {
    let props = getDocProperties(doc)
    expect(props).toEqual({
      images: expect.anything(),
      lists: { }
    })
  })
})

function readfile(name) {
  return fs.readFileSync(path.join(__dirname, 'files', name)).toString('utf8')
}