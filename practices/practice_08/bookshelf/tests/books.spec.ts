import {test, expect, type Page} from '@playwright/test'
import {mkdirSync} from 'node:fs'

const book = {id:1, title:'Солярис', author:'Станислав Лем'}
async function picture(page: Page, name: string) {
  if (!process.env.CAPTURE_EVIDENCE) return
  mkdirSync('report/screens', {recursive:true})
  await page.screenshot({path:'report/screens/'+name+'.png', animations:'disabled'})
}
async function form(page: Page) {
  await page.goto('/')
  await page.getByRole('button',{name:'Добавить книгу'}).first().click()
}
async function fill(page: Page) {
  await page.getByLabel('Название').fill(book.title)
  await page.getByLabel('Автор').fill(book.author)
}
test('Клавиатура, диалог и мобильный экран 390 px', async ({page}) => {
  await page.setViewportSize({width:390,height:844})
  await page.route('**/api/books', r=>r.fulfill({json:[]}))
  await page.goto('/')
  const add=page.getByRole('button',{name:'Добавить книгу'}).first()
  await expect(add).toBeEnabled()
  for(let i=0;i<6 && !(await add.evaluate(el=>el===document.activeElement));i++) await page.keyboard.press('Tab')
  await expect(add).toBeFocused()
  await picture(page,'mobile-focus')
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Название')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(add).toBeFocused()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
test('Обязательные поля и ввод из пробелов', async ({page}) => {
  let posts=0
  await page.route('**/api/books', r=>{if(r.request().method()==='POST')posts++;return r.fulfill({json:[]})})
  await form(page)
  await page.getByLabel('Название').fill('   ')
  await page.getByRole('button',{name:'Сохранить книгу'}).click()
  await expect(page.getByText('Введите название книги')).toBeVisible()
  await expect(page.getByText('Введите имя автора')).toBeVisible()
  await picture(page,'validation')
  expect(posts).toBe(0)
})
test('Задержка, двойной клик и повторный Enter создают один запрос', async ({page}) => {
  let posts=0
  let release!:()=>void
  const held=new Promise<void>(resolve=>{release=resolve})
  await page.route('**/api/books',async r=>{
    if(r.request().method()==='GET') return r.fulfill({json:[]})
    posts++
    expect(r.request().postDataJSON()).toEqual({title:book.title,author:book.author})
    await held
    await r.fulfill({status:201,json:book})
  })
  await form(page)
  await fill(page)
  const save=page.getByRole('button',{name:'Сохранить книгу'})
  const bounds=await save.boundingBox()
  if(!bounds) throw Error('Кнопка вне экрана')
  await page.mouse.dblclick(bounds.x+bounds.width/2,bounds.y+bounds.height/2)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button',{name:'Сохраняем…'})).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect.poll(()=>posts).toBe(1)
  await picture(page,'loading')
  release()
  await expect(page.getByRole('heading',{name:book.title})).toHaveCount(1)
  expect(posts).toBe(1)
})
test('Ошибка API сохраняет ввод, повторная отправка показывает книгу', async ({page}) => {
  let posts=0
  await page.route('**/api/books',r=>{
    if(r.request().method()==='GET')return r.fulfill({json:[]})
    return ++posts===1?r.fulfill({status:500,json:{error:'Сбой'}}):r.fulfill({status:201,json:book})
  })
  await form(page);await fill(page)
  await page.getByLabel('Автор').press('Enter')
  await expect(page.getByText('Не удалось сохранить книгу')).toBeVisible()
  await expect(page.getByLabel('Название')).toHaveValue(book.title)
  await expect(page.getByLabel('Автор')).toHaveValue(book.author)
  await picture(page,'error')
  await page.getByRole('button',{name:'Попробовать снова'}).click()
  await expect(page.getByRole('heading',{name:book.title})).toBeVisible()
  await expect(page.getByText(book.author)).toBeVisible()
})
test('Загрузка списка, сбой чтения и пустой ответ',async({page})=>{
  let broken=true
  let release!:()=>void
  const held=new Promise<void>(resolve=>{release=resolve})
  await page.route('**/api/books',async r=>{
    await held
    return broken?r.fulfill({status:500,json:{error:'Сбой'}}):r.fulfill({json:[]})
  })
  await page.goto('/')
  await expect(page.getByText('Загружаем полку…')).toBeVisible()
  release()
  const retry=page.getByRole('button',{name:'Повторить загрузку'})
  await expect(retry).toBeVisible();broken=false;await retry.click()
  await expect(page.getByRole('heading',{name:'Здесь пока тихо'})).toBeVisible()
  await picture(page,'empty')
})
test('Настоящий API: ввод с клавиатуры, запись и повторная загрузка',async({page})=>{
  await form(page)
  await page.keyboard.type('Solaris')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Stanislaw Lem')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading',{name:'Solaris'})).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading',{name:'Solaris'})).toBeVisible()
  await expect(page.getByText('Stanislaw Lem')).toBeVisible()
  await picture(page,'real-api')
})

