const fs = require('fs')
/** @type {SimpleHistogram} */
const histogram = JSON.parse(fs.readFileSync('./dumpHistogram.json', 'utf8'))
/** @type {{ [s: string]: number }} */
const perf = JSON.parse(fs.readFileSync('./dumpPerf.json', 'utf8'))

const totalTime = Object.values(perf).reduce((n,m) => n + m, 0)
const untouched = Object.values(perf).length - Object.values(histogram).length
const totalHits = Object.values(histogram).reduce((n,m) => n + m, 0) + untouched + Object.values(histogram).length

let i = 0
/** @type {{ file: string, percentTime: number, percentHits: number, cost: number }[]} */
let acc = []
for (const k of Object.keys(perf)) {
    const otherk = k.replace(/tsrunner-[a-z]+?:\/\//, '')
    const percentTime = perf[k] / totalTime
    const percentHits = (1 + (histogram[otherk] || 0)) / totalHits
    const cost = Math.log(percentTime / percentHits)
    acc.push({ file: otherk, percentTime, percentHits, cost})
    if (histogram[otherk])
        i++
}
console.log(i)
// seen 2 of them
// [1, 2, 0, 0, 0]; total=3
// -> [2, 3, 1, 1, 1]; total = 5 + 3
acc.sort((x,y) => y.cost - x.cost)
fs.writeFileSync('./dumpCombined.json', JSON.stringify(acc), 'utf8')
