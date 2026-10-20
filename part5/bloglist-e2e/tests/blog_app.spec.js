const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, likeBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'Arto Hellas',
        username: 'hellas',
        password: 'secret'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'End to end testing with Playwright', 'Playwright Team', 'https://playwright.dev/')

      await expect(page.locator('.success')).toContainText('a new blog End to end testing with Playwright by Playwright Team added')
      await expect(page.locator('.blog')).toHaveCount(1)
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Likeable blog', 'Some Author', 'http://example.com')

      const blog = page.locator('.blog').filter({ hasText: 'Likeable blog' })
      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByText('likes 0')).toBeVisible()

      await blog.getByRole('button', { name: 'like' }).click()
      await expect(blog.getByText('likes 1')).toBeVisible()
    })

    test('the user who added the blog can delete it', async ({ page }) => {
      await createBlog(page, 'Blog to be removed', 'Some Author', 'http://example.com')

      const blog = page.locator('.blog').filter({ hasText: 'Blog to be removed' })
      await blog.getByRole('button', { name: 'view' }).click()

      page.on('dialog', dialog => dialog.accept())
      await blog.getByRole('button', { name: 'remove' }).click()

      await expect(page.locator('.blog')).toHaveCount(0)
      await expect(page.getByText('Blog to be removed Some Author')).not.toBeVisible()
    })

    test('only the user who added the blog sees the remove button', async ({ page }) => {
      await createBlog(page, 'Blog by Matti', 'Some Author', 'http://example.com')

      const blog = page.locator('.blog').filter({ hasText: 'Blog by Matti' })
      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByRole('button', { name: 'remove' })).toBeVisible()

      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'hellas', 'secret')
      await expect(page.getByText('Arto Hellas logged in')).toBeVisible()

      await blog.getByRole('button', { name: 'view' }).click()
      await expect(blog.getByText('likes 0')).toBeVisible()
      await expect(blog.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are ordered by likes, most liked first', async ({ page }) => {
      await createBlog(page, 'first blog', 'Author One', 'http://example.com/1')
      await createBlog(page, 'second blog', 'Author Two', 'http://example.com/2')
      await createBlog(page, 'third blog', 'Author Three', 'http://example.com/3')

      await likeBlog(page, 'second blog', 3)
      await likeBlog(page, 'third blog', 1)

      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('second blog')
      await expect(blogs.nth(1)).toContainText('third blog')
      await expect(blogs.nth(2)).toContainText('first blog')
    })
  })
})
