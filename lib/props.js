const { JSONPath } = require('jsonpath-plus')

function getDocProperties(doc) {
  return {
    lists: getDocListProperties(doc),
    images: getDocImageProperties(doc)
  }
}

function getDocListProperties(doc) {
  lists = { }
  if (!doc || !doc.lists) return lists
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
  if (!doc || !doc.inlineObjects) return images
  for (let key in doc.inlineObjects) {
    let props = doc.inlineObjects[key]
    let uri = JSONPath({json: props, path: '$..contentUri'})[0]
    let h = JSONPath({json: props, path: '$..height.magnitude'})[0]
    let w = JSONPath({json: props, path: '$..width.magnitude'})[0]
    images[key] = { uri, h, w }
  }
  return images
}

module.exports = {
  getDocProperties,
  getDocListProperties,
  getDocImageProperties
}