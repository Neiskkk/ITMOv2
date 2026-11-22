import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { IncomingMessage, ServerResponse } from "node:http"

type Book = {id: number; title: string; author: string}

export async function booksApi(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (req.url?.split("?")[0] !== "/api/books") return next()
  const directory = process.env.BOOKS_DATA_DIR || ".data"
  const path = join(directory, "books.json")
  function send(status: number, value: unknown) {
    res.writeHead(status, {"Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"})
    res.end(JSON.stringify(value))
  }
  function readBooks(): Book[] {
    try { return JSON.parse(readFileSync(path, "utf8")) }
    catch (err) { if ((err as NodeJS.ErrnoException).code === "ENOENT") return []; throw err }
  }
  try {
    if (req.method === "GET") return send(200, readBooks())
    if (req.method !== "POST") return send(405, {error: "Метод не поддерживается"})
    let raw = ""
    for await (const chunk of req) {
      raw += chunk.toString("binary")
      if (raw.length > 16384) return send(413, {error: "Слишком длинная запись"})
    }
    let input
    try { input = JSON.parse(Buffer.from(raw, "binary").toString("utf8")) }
    catch { return send(400, {error: "Некорректный JSON"}) }
    if (typeof input?.title !== "string" || typeof input?.author !== "string" ||
        !input.title.trim() || !input.author.trim()) return send(422, {error: "Укажите название и автора"})
    const books = readBooks()
    const book = {id: (books.at(-1)?.id ?? 0) + 1, title: input.title.trim(), author: input.author.trim()}
    mkdirSync(directory, {recursive:true})
    writeFileSync(path + ".tmp", JSON.stringify([...books, book]), "utf8")
    renameSync(path + ".tmp", path)
    send(201, book)
  } catch { send(500, {error: "Не удалось обратиться к хранилищу"}) }
}

