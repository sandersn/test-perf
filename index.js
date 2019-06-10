const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
const git = require('simple-git/promise')(tsPath)
const readline = require('readline')
const { collectCommits } = require('./common')
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)

async function main() {
    // const commits = await git.log({ from: "f617d1641b00366ff9c5684fec06cec7f1c26d2e", to: "master" })
    /** @type {Edits} */
    const map = new Map()
    await collectCommits(git, "release-3.1", "master", files => fillMap(files, map))
    console.log()
    format(map)
}

/**
 * @param {string[]} files
 * @param {Edits} map
 */
function fillMap(files, map) {
    const tests = new Set(files.filter(f => f.startsWith('test')).map(s => s.split('/', 3).join('/')))
    const sources = new Set(files.filter(f => /src\/compiler\/[^\/]+\.ts/.test(f)))
    for (const src of sources) {
        /** @type {EditHistogram} */
        const h = map.get(src) || { count: 0, testEdits: new Map() }
        for (const test of tests) {
            h.testEdits.set(test, (h.testEdits.get(test) || 0) + 1)
        }
        h.count++
        map.set(src, h)
    }
}

/**
 * @param {Edits} map
 */
function format(map) {
    map.forEach((v,k) => {
        console.log(v.count, v.testEdits.get('tests/cases/fourslash') || 0, v.testEdits.get('tests/baselines/reference') || 0, k)
    })
}

main().catch(e => { console.log(e); process.exit(1) })
