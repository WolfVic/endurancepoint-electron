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
  nom = document.getElementById('name'),
  snack = document.getElementById('snack')
var filesEnd = [];
let cheminSave = app.getPath("documents")

function getTypeCotation() {
  let radios = document.getElementsByName('points');

for (let i = 0, length = radios.length; i < length; i++) {
  if (radios[i].checked) {
    return radios[i].value
  }
}
}

loadFiles.onclick = () => {
  csv.click()
}

const saveFile = async (numero) => {
  try {
    const chemin = await dialog.showSaveDialogSync({
      title: "Sauvegarde de " + filesEnd[numero].name,
      defaultPath: path.join(cheminSave,filesEnd[numero].name),
      filters: [{name: "Microsoft Excel", extensions: ['xlsx']}]
    })
    if (chemin === undefined) {
      throw Error('noPath')
    }
    let file = filesEnd[numero]
    await fs.writeFileSync(chemin, file.data)
    classe.value = ""
    sexe.value = ""
    distance.value = ""
    nom.value = ""
    csv.value = ""
    dlAll.disabled = true;
    snack.MaterialSnackbar.showSnackbar({
      message: "Fichier enregistré",
      timeout: 1500
    })
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
    } else {
    }
    // console.error(e)
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
  try {
    let cla, type, long, name, file, cot
    cla = classe.value
    type = sexe.value.slice(0,1).toUpperCase()
    long = distance.value
    cot = getTypeCotation()
    if(cla && type && long) {
      name = nom.value + ".xlsx"
      file = csv.files[0]
      let reader = new FileReader()
      reader.onload = async e => {
        filesEnd = [] /* TODO modifier si gestion de plusieurs fichiers */
        let data = reader.result
        let result = await createFile(name, data, cla, type, long, cot)
        filesEnd.push({name: name, data: result})
        saveFile(0)
      }
      reader.readAsText(file)
    } else {
      snack.MaterialSnackbar.showSnackbar({
        message: "Erreur: Manque d'informations (classe, sexe, distance)",
        timeout: 2000
      })
    }
  } catch (e) {
    console.error("read text")
    console.error(e)
    snack.MaterialSnackbar.showSnackbar({
      message: "Erreur: manque un fichier .csv",
      timeout: 2000
    })
  }

}

const handleFiles = async files => {
  if (files && files.length > 0) {
    // console.log('files :', files[0]);
    for (let i = 0; i < files.length; i++) {
      list.innerHTML =""
      let file = files[i]
      let name = file.name
      let cla =  name.match(/^\d{1}/) === null ? "" : name.match(/^\d{1}/)[0]
      let type = name.match(/f|g/) === null ? "" : name.match(/f|g/)[0].toUpperCase()
      let long = name.match(/(\d+m)/) === null ? "" : name.match(/(\d+m)/)[0].substring(0, name.match(/(\d+m)/)[0].length -1)
      classe.value = cla
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

