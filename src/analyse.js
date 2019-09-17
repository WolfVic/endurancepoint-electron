const fs = require('fs')
const Excel = require('exceljs')
const csv = Excel.csv
const vitesseList = new Map()
vitesseList.set('3G', {min: 2.25, max: 12})
vitesseList.set('4G', {min:2.75, max: 12.5})
vitesseList.set('5G', {min: 3.15, max: 13})
vitesseList.set('6G', {min: 3.15, max: 13})
vitesseList.set('F', {min: 2.22, max: 11})

function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function HMStoSecs(hms) {
    let arr = hms.split(':')
    return parseInt(arr[0], 10) * 3600 + parseInt(arr[1], 10) * 60 + parseInt(arr[2], 10)
}

exports = module.exports = {}

async function createFile(filename, donnees, classe, type, long) {
    const titre = filename
    try {
        console.log('titre: ', titre)
        classe = classe? classe : filename.match(/^\d{1}/)[0]
        type = type? type : filename.match(/f|g/) === null ? 'f'.toUpperCase() : filename.match(/f|g/)[0].toUpperCase()
        long = long? long : filename.match(/(\d+m)/)[0].substring(0, long.length -1)
        const vitesse = type === 'F' ? vitesseList.get('F') : vitesseList.get(classe + type)
        console.log('classe: ', classe)
        console.log('type: ', type)
        console.log('vitesse: ', vitesse )
        console.log('long: ', long)
        let wb = new Excel.Workbook()
        let ws = wb.addWorksheet('Résultat')
        ws.columns = [{
                key: 'id',
                width: 10
            },
            {
                key: 'note',
                width: 10,
                style: {
                    numFmt: '0.00'
                }
            },
            {
                key: 'kh',
                width: 10,
                style: {
                    numFmt: '0.00'
                }
            },
            {
                key: 'tour',
                width: 10
            },
            {
                key: 'total',
                width: 10,
                style: {
                    numFmt: 'mm:ss'
                }
            },
            {
                key: 'moyTour',
                width: 12,
                style: {
                    numFmt: 'mm:ss'
                }
            }
        ]
        ws.mergeCells('A1:D1')
        ws.getCell('A1').value = titre
        ws.getCell('A1').font = {
            bold: true,
            underline: 'single'
        }
        ws.getCell('A1').alignment = {
            vertical: 'center',
            horizontal: 'center'
        }
        ws.getRow(2).values = ['Numero', 'Points', 'Km/h', 'Nb Tours', 'Total', 'Temps/Tours']
        let brut = wb.addWorksheet('brut')
        brut.columns = [{
                key: 'id',
                width: 10
            },
            {
                key: 'tour',
                width: 10
            },
            {
                key: 'temps',
                width: 10
            }
        ]
        brut.getRow(1).values = ['Id', 'Tour', 'Temps', '', 'Distance', 'Minimum', 'Maximum']
        brut.getRow(2).values = ['', '', '', '', long, vitesse.min, vitesse.max]
        let dataRow = donnees.toString().split('\n')
        // let data = new Map()
        let data = []
        // dataRow.forEach((row, i) => {
        //     let arr = row.split(';')
        //     let time = String(arr[1]).substring(0,8)
        //     let id = parseInt(arr[0],10)
        //     let info = {
        //         id: arr[0],
        //         time: HMStoSecs(time)
        //     }
        //     data.push(info)
        // })
        for (let i = 1; i < dataRow.length - 1; i++) {
            let arr = dataRow[i].split(';')
            let time = String(arr[1]).substring(0, 8)
            let id = parseInt(arr[0], 10)
            // console.log(arr)
            let info = {
                id,
                time: HMStoSecs(time)
            }
            data.push(info)
        }
        data.sort((a, b) => a.id - b.id)
        let last = data[data.length - 1].id
        let tri = new Map()
        data.forEach((row, i, arr) => {
            if (tri.has(row.id)) {
                let old = tri.get(row.id)
                // console.log(old.id)
                old.tours.push(row)
                if (row.time > old.last.time) old.last = row
                tri.set(row.id, old)
            } else {
                let info = {
                    id: row.id,
                    tours: [row],
                    last: row
                }
                tri.set(row.id, info)
            }
        })
        let resultat = new Map()
        for (let i = 1; i <= last; i++) {
            if (tri.has(i)) {
                const v = tri.get(i)
                const nbTour = v.tours.length
                const secTot = v.last.time
                console.log('secTot :', secTot);
                const ms = long * nbTour / secTot
                const kh = ms * 3.6
                const moyTourS = secTot / nbTour
                // console.log(secTot + '/' + nbTour +' : ' +moyTourS)
                let date = new Date(null);
                let date2 = new Date(null)
                date.setSeconds(moyTourS); // specify value for SECONDS here
                let moyTourM = date.toISOString().substr(14, 5);
                date2.setSeconds(secTot)
                let minTot = date2.toISOString().substr(14, 5)
                ws.addRow()
                let lastRowInfo = ws.rowCount
                let formula = '((C'+lastRowInfo+'-brut!$F$2)*(20-0.5)/(brut!$G$2-brut!$F$2)+0.5)'
                // console.log('formula :', formula);
                let info = {
                    id: {formula: v.id},
                    note: {formula:formula, result: undefined},
                    kh: {formula:'brut!E2*D'+lastRowInfo+'/'+secTot+'*3.6'},
                    tour: nbTour,
                    total: {formula: secTot+'/86400'},
                    moyTour: {formula: `E${lastRowInfo}/D${lastRowInfo}`, result:undefined}
                }
                resultat.set(v.id, info)
                ws.getRow(lastRowInfo).values = info
                brut.addRow()
                let lastRow = brut.rowCount
                brut.mergeCells(lastRow, 1, lastRow, 3)
                brut.getCell(lastRow, 1).value = "Eleve: " + v.id
                let triEle = v.tours.sort((a,b) => a.time - b.time)
                triEle.forEach((row, i) => {
                    let date = new Date(null)
                    date.setSeconds(row.time)
                    brut.addRow({
                        tour: i + 1,
                        temps: date.toISOString().substr(14, 5)
                    })
                })
            } else {
                console.log(i + ' : absent')
                ws.addRow({id: i, note: 'ABSENT', kh:'ABSENT', tour: 'ABSENT', total: 'ABSENT', moyTour:'ABSENT'})
            }
        }
        // tri.forEach((v, k, m) => {
        //     const nbTour = v.tours.length
        //     const secTot = v.last.time
        //     const ms = long * nbTour / secTot
        //     const kh = ms * 3.6
        //     const moyTourS = secTot / nbTour
        //     // console.log(secTot + '/' + nbTour +' : ' +moyTourS)
        //     let date = new Date(null);
        //     let date2 = new Date(null)
        //     date.setSeconds(moyTourS); // specify value for SECONDS here
        //     let moyTourM = date.toISOString().substr(14, 5);
        //     date2.setSeconds(secTot)
        //     let minTot = date2.toISOString().substr(14, 5)
        //     let info = {
        //         id: v.id,
        //         note: Math.round(map(kh, vitesse.min, vitesse.max, 0.5, 20) * 100) / 100,
        //         kh: Math.round(kh * 100) / 100,
        //         tour: nbTour,
        //         total: minTot,
        //         moyTour: moyTourM
        //     }
        //     resultat.set(v.id, info)
        //     ws.addRow(info)
        //     brut.addRow()
        //     let last = brut.rowCount
        //     brut.mergeCells(last, 1, last, 3)
        //     brut.getCell(last, 1).value = "Eleve: " + v.id
        //     let tri = v.tours.sort((a,b) => a.time - b.time)
        //     tri.forEach((row, i) => {
        //         let date = new Date(null)
        //         date.setSeconds(row.time)
        //         brut.addRow({
        //             tour: i,
        //             temps: date.toISOString().substr(14, 5)
        //         })
        //     })
        // })

        
        // await wb.xlsx.writeFile('./finish/' +titre + '.xlsx');
        // return toSend ? mail.send(to, titre, titre + '.xlsx') : console.log('Fichier écrit');
        return wb.xlsx.writeBuffer();
    }
    catch (err) {
        throw err;
    }
}



exports.createFile = createFile

// var file = fs.readFileSync('./finish/3b1b6 270m filles 20min-2018-10-15.csv', {encoding: 'utf8'})
// createFile('3b1b6 270m filles 20min-2018-10-15', file, false, '')