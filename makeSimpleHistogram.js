const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
const outputPath = "./dumpHistogram.json"
const { collectCommits } = require('./common')
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)
const git = require('simple-git/promise')(tsPath)

async function main() {
    /** @type {SimpleHistogram} */
    const map = Object.create(null)
    await collectCommits(git, "release-2.3", "master", "Wesley Wigham", files => fillMap(files, map))
    console.log()
    console.log('Writing JSON:', outputPath)
    write(map, outputPath)
}

/**
 * @param {string[]} files
 * @param {SimpleHistogram} map
 */
function fillMap(files, map) {
    // TODO: unit tests too?
    const tests = files.filter(f => f.startsWith('tests/cases/'))
    for (const test of tests) {
        map[test] = (map[test] || 0) + 1
    }
}

/**
 * @param {SimpleHistogram} map
 * @param {string} path
 */
function write(map, path) {
    fs.writeFileSync(path, JSON.stringify(map), 'utf8')
}

main().catch(e => { console.log(e); process.exit(1) })
