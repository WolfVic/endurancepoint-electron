// var analyse = require('./analyse')
const ipcRenderer = require('electron').ipcRenderer
const {
  dialog,
  app
} = require('electron').remote
const {
  createFile
} = require('./analyse.js')
const fs = require('fs')
const path = require('path')
var csv = document.getElementById('csv');
var loadFiles = document.getElementById('loadFiles'),
  list = document.getElementById('list'),
  validerbtn = document.getElementById('validerBtn'),
  dlAll = document.getElementById('dlAll')
var filesEnd = [];

loadFiles.onclick = () => {
  csv.click()
}

const saveFile = async (numero) => {
  try {
    const chemin = dialog.showSaveDialog({
      title: "Sauvegarde de " + filesEnd[numero].name,
      defaultPath: path.join(app.getPath("documents"),filesEnd[numero].name),
      filters: [{name: "Microsoft Excel", extensions: ['xlsx']}]
    })
    console.log(chemin)
    if (chemin === undefined) {
      throw Error('noPath')
    }
    let file = filesEnd[numero]
      console.log(path.join(chemin, file.name))
      fs.writeFileSync(chemin, file.data)
  } catch (e) {
    if (e.message !== "noPath") {
      dialog.showMessageBox({
        type: "error",
        buttons: ["Recommencer", "Annuler"],
        defaultId: 1,
        title: "Erreur Enregistrement",
        message: "Impossible d'enregistrer le fichier, veuillez essayer un autre dossier",
        cancelId: 1
      }, (res) => {
        switch (res) {
          case 0:
            saveFile(numero)
            break;
          case 1:
            break;

        }
      })
    }
    console.error(e)
  }
}

const enregistrerFichiers = async () => {
  try {
    const chemin = dialog.showOpenDialog({
      title: "Choissez un dossier",
      properties: ["openDirectory"],
      defaultPath: app.getPath("documents")
    })
    if (chemin === undefined) {
      throw Error('noPath')
    }
    filesEnd.forEach(file => {
      console.log(path.join(chemin[0], file.name))
      fs.writeFileSync(path.join(chemin[0], file.name), file.data)

    })
  } catch (e) {
    if (e.message !== "noPath") {
      dialog.showMessageBox({
        type: "error",
        buttons: ["Recommencer", "Annuler"],
        defaultId: 1,
        title: "Erreur Enregistrement",
        message: "Impossible d'enregistrer les fichiers, veuillez essayer un autre dossier",
        cancelId: 1
      }, (res) => {
        switch (res) {
          case 0:
            enregistrerFichiers()
            break;
          case 1:
            break;

        }
      })
    }
    console.error(e)
  }
}

dlAll.onclick = () => enregistrerFichiers()

const handleFiles = async files => {
  list.innerHTML = ""
  if (files && files.length > 0) {
    // console.log('files :', files[0]);
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      let name = file.name
      let reader = new FileReader()
      reader.onload = async e => {
        // console.log(e)
        let data = reader.result
        // console.log('name :', name);
        // console.log('data :', data);
        let result = await createFile(name, data)
        let fileFini = {}
        fileFini.name = name.slice(0, name.length - 3) + 'xlsx'
        fileFini.data = result
        filesEnd.push(fileFini)
        const li = document.createElement('span')
        const a = document.createElement('a')
        a.style = "cursor:pointer;"
        a.innerText = fileFini.name
        li.onclick = () => {
          saveFile(i)
        }
        li.appendChild(a)
        list.appendChild(li)
      }
      reader.readAsText(file)
    }
  }
}