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
  dlAll = document.getElementById('dlAll'),
  classe = document.getElementById('classe'),
  sexe = document.getElementById('sexe'),
  distance = document.getElementById('distance'),
  nom = document.getElementById('name')
var filesEnd = [];
let cheminSave = app.getPath("documents")

loadFiles.onclick = () => {
  csv.click()
}

const saveFile = async (numero) => {
  try {
    const chemin = dialog.showSaveDialog({
      title: "Sauvegarde de " + filesEnd[numero].name,
      defaultPath: path.join(cheminSave,filesEnd[numero].name),
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
      defaultPath: cheminSave
    })
    if (chemin === undefined) {
      throw Error('noPath')
    }
    cheminSave = chemin[0]
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

// dlAll.onclick = () => enregistrerFichiers()
dlAll.onclick = async () => {
  let cla, type, long, name, file
  cla = classe.value
  type = sexe.value
  long = distance.value
  name = nom.value + ".xlsx"
  file = document.getElementById('csv').files[0]
  let reader = new FileReader()
  reader.onload =async e => {
    filesEnd = []
    let data = reader.result
    let result = await createFile(name, data, cla, type, long)
    filesEnd.push({name: name, data: result})
    saveFile(0)

  }
  reader.readAsText(file)

}

const handleFiles = async files => {
  if (files && files.length > 0) {
    // console.log('files :', files[0]);
    for (let i = 0; i < files.length; i++) {
      list.innerHTML =""
      let file = files[i]
      let name = file.name
      let cla =  name.match(/^\d{1}/)[0]
      let type = name.match(/f|g/) === null ? 'f'.toUpperCase() : name.match(/f|g/)[0].toUpperCase()
      let long = name.match(/(\d+m)/)[0]
      long = long.substring(0, long.length -1)
      classe.value = cla
      console.log('type :', type);
      sexe.value = type  
      distance.value = long
      nom.value = name.slice(0, name.length - 4)
      dlAll.disabled = false;
      // let reader = new FileReader()
      // reader.onload = async e => {
      //   let data = reader.result
      //   let result // = await createFile(name, data)
      //   let fileFini = {}
      //   fileFini.name = name.slice(0, name.length - 3) + 'xlsx'
      //   fileFini.data = result
      //   filesEnd.push(fileFini)
      //   const li = document.createElement('li')
      //     li.className = "mdl-list__item"
      //     // li.onclick = () => {
      //       //   saveFile(i)
      //       // }
      //     const a = document.createElement('a')
      //       a.style = "cursor:pointer;"
      //       a.innerText = fileFini.name
      //       a.className = "mdl-list__item-primary-content"
      //       a.id="file-"+i
      //     // const action = document.createElement('span')
      //     //   action.className = "mdl-list__item-secondary-content"
      //     //   const btnE = document.createElement('button')
      //     //     btnE.innerText = "Edit"
      //     //     btnE.className = "mdl-list__item-secondary-action"
      //     // action.appendChild(btnE)
      //     // li.appendChild(action)
      //   li.appendChild(a)
      //   list.appendChild(li)
      //   dlAll.disabled = false;
      // }
      // reader.readAsText(file)
    }
  }
}

