import {mkdtempSync, rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createServer} from 'vite'

const directory = mkdtempSync(join(tmpdir(), 'bookshelf-test-'))
process.env.BOOKS_DATA_DIR = directory
const server = await createServer({server:{host:'127.0.0.1',port:4186,strictPort:true}})
await server.listen()
async function close() {
  await server.close()
  rmSync(directory, {recursive:true, force:true})
  process.exit(0)
}
process.on('SIGTERM', close)
process.on('SIGINT', close)

