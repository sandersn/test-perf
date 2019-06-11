const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
const outputPath = "./dumpHistogram.json"
const { collectCommits } = require('./common')
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)
const git = require('simple-git/promise')(tsPath)

/** @typedef {{ file: string, percentTime: number, percentHits: number, cost: number }[]} Thing */
async function main() {
    /** @type {Thing}  */
    const combined = JSON.parse(fs.readFileSync('./dumpCombined.json', 'utf8'))
    const start = "f617d1641b00366ff9c5684fec06cec7f1c26d2e" // "release-2.3"
    let i = 0
    let fail = 0
    await collectCommits(git, start, "master", "Anders Hejlsberg", files => {
        i++
        const good = new Set(combined.slice(400).map(o => o.file))
        if (!files.filter(f => f.startsWith('tests/cases/')).every(x => good.has(x))) {
            fail++
        }
    })
    console.log('Total:', i, '; failed:', fail, '=', fail / i)
}

main().catch(e => { console.log(e); process.exit(1) })
