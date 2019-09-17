const path = require('path')
require('dotenv').config()

module.exports = {
  "packagerConfig": {
    "name":"EnduPoint",
    "icon": path.join(__dirname,"src/assets/icons/icon.png"),
    "ignore": ".env"
  },
  "makers": [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "author": "Victor Santelé",
        "icon": path.join(__dirname,"src/assets/icons/icon.png"),
      }
    },
    {
      "name": "@electron-forge/maker-zip",
      "platforms": [
        "darwin"
      ]
    },
    {
      "name": "@electron-forge/maker-deb",
      "config": {}
    },
    {
      "name": "@electron-forge/maker-rpm",
      "config": {}
    }
  ],
  "publishers": [
    {
      "name": "@electron-forge/publisher-github",
      "config": {
        "repository": {
          "owner": "wolfvic",
          "name": "endurancepoint"
        },
        "authToken": process.env.GITHB_TOKEN
      }
    }
  ],
  electronPackagerConfig: {
    icon: path.join(__dirname,"src/assets/icons/icon.png"),
    packageManager: "yarn" ,
    dir: "./src"
  },
  elecronWinstallerConfig: {
    name: "EnduPoint",
    iconUrl: path.join(__dirname,"src/assets/icons/icon.ico")
  }
}