import brotliSize from 'brotli-size'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

let __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Module...
 */
await esbuild.build({
  entryPoints: ['js/index.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/flux.module.js',
})

await esbuild.build({
  entryPoints: ['js/editor.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/editor.module.js',
})

outputSize('dist/flux.module.js')
outputSize('dist/editor.module.js')

/**
 * CDN...
 */
await esbuild.build({
  entryPoints: ['js/index.js'],
  bundle: true,
  outfile: 'dist/flux.js',
})

await esbuild.build({
  entryPoints: ['js/editor.js'],
  bundle: true,
  outfile: 'dist/editor.js',
})

outputSize('dist/flux.js')
outputSize('dist/editor.js')

/**
 * Minified CDN...
 */
await esbuild.build({
  entryPoints: ['js/index.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/flux.min.js',
})

await esbuild.build({
  entryPoints: ['js/editor.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/editor.min.js',
})

await esbuild.build({
  entryPoints: ['js/index-lite.js'],
  bundle: true,
  minify: true,
  outfile: '../flux/dist/flux-lite.min.js',
})

outputSize('dist/flux.min.js')
outputSize('dist/editor.min.js')

/**
 * Manifest...
 */
// Read the content of the generated file
let content = fs.readFileSync(path.join(__dirname, 'dist', 'flux.module.js'))
let hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
let manifest = { '/flux.js': hash }

content = fs.readFileSync(path.join(__dirname, 'dist', 'flux.css'))
hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
manifest['/flux.css'] = hash

content = fs.readFileSync(path.join(__dirname, 'dist', 'editor.module.js'))
hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
manifest['/editor.js'] = hash

content = fs.readFileSync(path.join(__dirname, 'dist', 'editor.css'))
hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
manifest['/editor.css'] = hash

// Write the manifest file
fs.writeFileSync(
  path.join(__dirname, 'dist', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
)

content = fs.readFileSync(path.join(__dirname, '../flux/dist', 'flux-lite.min.js'))
hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
manifest = { '/flux.js': hash }

content = fs.readFileSync(path.join(__dirname, '../flux/dist', 'flux-lite.css'))
hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8)
manifest['/flux.css'] = hash

fs.writeFileSync(
  path.join(__dirname, '../flux/dist', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
)

console.log("\x1b[32m", '\n')
console.log("\x1b[32m", 'Build complete and manifest generated')

function outputSize(file) {
    let size = bytesToSize(brotliSize.sync(fs.readFileSync(file)))

    console.log("\x1b[32m", `Bundle size (${file}): ${size}`)
}

function bytesToSize(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

    if (bytes === 0) return 'n/a'

    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)

    if (i === 0) return `${bytes} ${sizes[i]}`

    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}
