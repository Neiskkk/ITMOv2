import { FormEvent, useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  GalleryVerticalEnd,
  LibraryBig,
  LoaderCircle,
  Plus,
} from "lucide-react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Book = {
  id: number
  title: string
  author: string
}

type FieldErrors = {
  title?: string
  author?: string
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [demoFailurePending, setDemoFailurePending] = useState(false)
  const [showEmptyDemo, setShowEmptyDemo] = useState(false)

  const sending = useRef(false)
  const opener = useRef<HTMLElement | null>(null)
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const aborter = new AbortController()
    setLoadState("loading")
    fetch("/api/books", {signal: aborter.signal})
      .then(async response => {
        if (!response.ok) throw new Error("load")
        const saved = await response.json()
        if (!aborter.signal.aborted) {
          setBooks(saved)
          setLoadState("ready")
        }
      })
      .catch(() => { if (!aborter.signal.aborted) setLoadState("error") })
    return () => aborter.abort()
  }, [attempt])

  function openDialog(withFailureDemo = false) {
    opener.current = document.activeElement as HTMLElement
    setShowEmptyDemo(false)
    setTitle("")
    setAuthor("")
    setErrors({})
    setSaveError(false)
    setDemoFailurePending(withFailureDemo)
    setIsDialogOpen(true)
  }

  function openFailureDemo() {
    setShowEmptyDemo(false)
    openDialog(true)
  }

  function closeDialog(open: boolean) {
    if (isSaving) return
    setIsDialogOpen(open)
  }

  function validate() {
    const nextErrors: FieldErrors = {}

    if (!title.trim()) nextErrors.title = "Введите название книги"
    if (!author.trim()) nextErrors.author = "Введите имя автора"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateField(field: "title" | "author", value: string) {
    setErrors((current) => ({
      ...current,
      [field]: value.trim()
        ? undefined
        : field === "title"
          ? "Введите название книги"
          : "Введите имя автора",
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current || !validate()) return
    sending.current = true
    setSaveError(false)
    setIsSaving(true)
    try {
      if (demoFailurePending) {
        setDemoFailurePending(false)
        throw new Error("demo")
      }
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title: title.trim(), author: author.trim()}),
      })
      if (!response.ok) throw new Error("save")
      const book: Book = await response.json()
      setBooks(current => [...current, book])
      setIsDialogOpen(false)
    } catch {
      setSaveError(true)
    } finally {
      sending.current = false
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-[#202923]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.32]"
        aria-hidden="true"
      >
        <div className="absolute -top-36 -right-28 size-80 rounded-full border border-[#becdb9]" />
        <div className="absolute top-12 -right-16 size-48 rounded-full border border-[#becdb9]" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-[#ded8ca]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
        <header className="flex flex-col items-start justify-between gap-4 border-b border-[#d8d2c4] pb-5 sm:flex-row sm:items-center">
          <a
            href="#main-content"
            className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-[#c0d2bd]"
            aria-label="Книжная полка — на главную"
          >
            <span className="grid size-10 place-items-center rounded-full bg-forest text-white">
              <LibraryBig className="size-5" aria-hidden="true" />
            </span>
            <span className="font-serif text-lg tracking-[-0.01em] text-forest sm:text-xl">
              Книжная полка
            </span>
          </a>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={loadState !== "ready"}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  Демонстрация
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setShowEmptyDemo(true)}>
                  <GalleryVerticalEnd className="size-4" aria-hidden="true" />
                  Пустая полка
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={openFailureDemo}>
                  <CircleAlert className="size-4" aria-hidden="true" />
                  Ошибка сохранения
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={loadState !== "ready"}
              onClick={() => openDialog()}
            >
              <Plus className="size-4" aria-hidden="true" />
              Добавить книгу
            </Button>
          </div>
        </header>

        <section
          id="main-content"
          className="flex flex-1 flex-col py-10 sm:py-14"
        >
          <div className="mb-10 max-w-2xl sm:mb-14">
            <h1 className="font-serif text-[2.85rem] leading-[0.97] tracking-[-0.045em] text-[#173c30] sm:text-6xl">
              Истории, которые
              <br />
              ещё впереди
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#657069] sm:text-lg">
              Сохраняйте книги, к которым хочется вернуться, когда наступит
              подходящий момент.
            </p>
          </div>

          {loadState === "loading" ? (
            <p role="status">Загружаем полку…</p>
          ) : loadState === "error" ? (
            <Alert variant="destructive">Не удалось загрузить книги. <Button onClick={() => setAttempt(n => n+1)}>Повторить загрузку</Button></Alert>
          ) : books.length === 0 || showEmptyDemo ? (
            <Card className="relative flex min-h-72 flex-1 flex-col items-center justify-center overflow-hidden border-dashed px-5 py-10 text-center shadow-[0_16px_50px_rgba(49,61,53,0.05)] sm:min-h-80">
              <div
                className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_bottom,transparent,rgba(215,223,209,0.35))]"
                aria-hidden="true"
              />
              <div className="relative mb-5 grid size-16 place-items-center rounded-full border border-[#cad3c5] bg-[#edf1e8] text-[#315443]">
                <BookOpen className="size-7" strokeWidth={1.7} aria-hidden="true" />
              </div>
              <h2 className="relative font-serif text-2xl text-[#203c31]">
                Здесь пока тихо
              </h2>
              <p className="relative mt-2 max-w-sm text-sm leading-6 text-[#727972]">
                Добавьте первую книгу — пусть ожидание хорошей истории начнётся
                здесь.
              </p>
              <Button className="relative mt-6" onClick={() => openDialog()}>
                <Plus className="size-4" aria-hidden="true" />
                Добавить книгу
              </Button>
              {showEmptyDemo && books.length > 0 && (
                <div className="relative mt-5 flex flex-col items-center gap-2">
                  <p className="text-xs text-[#68736d]">
                    Демо-режим: сохранённые книги остаются на полке
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmptyDemo(false)}
                  >
                    Вернуться к книгам
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div>
              <div className="mb-5 flex items-end justify-between">
                <h2 className="font-serif text-2xl text-[#203c31]">
                  На полке
                </h2>
                <p className="text-sm text-[#6c756f]">
                  {books.length}{" "}
                  {{one: "книга", few: "книги", many: "книг", other: "книги", zero: "книг", two: "книги"}[new Intl.PluralRules("ru").select(books.length)]}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book, index) => (
                  <Card
                    key={book.id}
                    className="group overflow-hidden p-5 shadow-[0_10px_30px_rgba(49,61,53,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(49,61,53,0.1)]"
                  >
                    <div
                      className={`mb-8 flex h-32 items-end rounded-xl p-4 ${
                        index % 3 === 0
                          ? "bg-[#dce5d8]"
                          : index % 3 === 1
                            ? "bg-[#eadfd1]"
                            : "bg-[#d9e2e3]"
                      }`}
                    >
                      <span className="font-serif text-4xl text-[#274b3b]/25">
                        {book.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl leading-tight text-forest">
                      {book.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#6c756f]">{book.author}</p>
                    <div className="mt-5 flex items-center gap-2 border-t border-[#e5e0d4] pt-4 text-xs font-semibold text-[#557060]">
                      <Check className="size-3.5" aria-hidden="true" />
                      Сохранено на будущее
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent
          onCloseAutoFocus={event => {
            event.preventDefault()
            const target = opener.current
            if (target && target.isConnected && target !== document.body) target.focus()
            else document.querySelector<HTMLButtonElement>("header button:last-child")?.focus()
          }}
          onEscapeKeyDown={(event) => isSaving && event.preventDefault()}
          onPointerDownOutside={(event) => isSaving && event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Новая книга</DialogTitle>
            <DialogDescription>
              Добавьте книгу, которую хотите прочитать позже.
              {demoFailurePending && (
                <span className="mt-2 block font-semibold text-[#8a473d]">
                  Демо-режим: первая попытка сохранения завершится ошибкой.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {saveError && (
              <Alert variant="destructive">
                <div className="flex gap-3">
                  <AlertCircle
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">Не удалось сохранить книгу</p>
                    <p>Данные остались на месте. Попробуйте сохранить ещё раз.</p>
                  </div>
                </div>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="book-title">
                Название <span className="text-[#9c3f35]">*</span>
              </Label>
              <Input
                id="book-title"
                name="title" required
                autoFocus
                autoComplete="off"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (errors.title)
                    validateField("title", event.target.value)
                }}
                onBlur={(event) => validateField("title", event.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                disabled={isSaving}
                placeholder="Например, «Маленькая жизнь»"
              />
              {errors.title && (
                <p id="title-error" className="text-sm text-[#9c3f35]">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-author">
                Автор <span className="text-[#9c3f35]">*</span>
              </Label>
              <Input
                id="book-author"
                name="author" required
                autoComplete="off"
                value={author}
                onChange={(event) => {
                  setAuthor(event.target.value)
                  if (errors.author)
                    validateField("author", event.target.value)
                }}
                onBlur={(event) => validateField("author", event.target.value)}
                aria-invalid={Boolean(errors.author)}
                aria-describedby={errors.author ? "author-error" : undefined}
                disabled={isSaving}
                placeholder="Имя автора"
              />
              {errors.author && (
                <p id="author-error" className="text-sm text-[#9c3f35]">
                  {errors.author}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Сохраняем…
                  </>
                ) : saveError ? (
                  <>
                    Попробовать снова
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  "Сохранить книгу"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
