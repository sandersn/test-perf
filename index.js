const assert = require('assert')
const fs = require('fs')
const tsPath = "../../ts"
const git = require('simple-git/promise')(tsPath)
const path = require('path')
const readline = require('readline')
assert(fs.existsSync(tsPath), "Can't find Typescript at " + tsPath)
/** @typedef {Map<string, Histogram>} PathHistogram */
/** @typedef {{ count: number, histogram: Map<string, number> }} Histogram */

async function main() {
    const commits = await git.log({ from: "release-3.1", to: "master" })
    // const commits = await git.log({ from: "f617d1641b00366ff9c5684fec06cec7f1c26d2e", to: "master" })
    /** @type {PathHistogram} */
    const map = new Map()
    let i = 0
    for (const commit of commits.all) {
        i++
        if (isMergeCommit(commit.message) || isSquashMergeMessage(commit.message)) {
            readline.clearLine(process.stdout, /*left*/ -1)
            readline.cursorTo(process.stdout, 0)
            process.stdout.write(i + ": " + commit.date)
            const files = parseFiles(await git.show([commit.hash, "--stat=1000,960,40", "--pretty=oneline"]))
            fillMap(files, map)
        }
    }
    console.log()
    console.log(format(map))
}

/**
 * @param {string} s
 */
function isSquashMergeMessage(s) {
    return /\(#[0-9]+\)$/.test(s)
}

/**
 * @param {string} s
 */
function isMergeCommit(s) {
    return /Merge pull request #[0-9]+/.test(s)
}

/**
 * @param {string} s
 */
function parseFiles(s) {
    const lines = s.split('\n')
    // Note that slice(2) only works for merge commits, which have an empty newline after the title
    return lines.slice(2, lines.length - 2).map(line => line.split("|")[0].trim())
}

/**
 * @param {string[]} files
 * @param {PathHistogram} map
 */
function fillMap(files, map) {
    const tests = new Set(files.filter(f => f.startsWith('test')).map(s => s.split('/', 3).join('/')))
    const sources = new Set(files.filter(f => /src\/compiler\/[^\/]+\.ts/.test(f)))
    for (const src of sources) {
        /** @type {Histogram} */
        const h = map.get(src) || { count: 0, histogram: new Map() }
        for (const test of tests) {
            h.histogram.set(test, (h.histogram.get(test) || 0) + 1)
        }
        h.count++
        map.set(src, h)
    }
}

/**
 * @param {PathHistogram} map
 */
function format(map) {
    map.forEach((v,k) => {
        console.log(v.count, v.histogram.get('tests/cases/fourslash') || 0, v.histogram.get('tests/baselines/reference') || 0, k)
    })
}

main().catch(e => { console.log(e); process.exit(1) })
