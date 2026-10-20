import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  const blog = {
    id: '1',
    title: 'Component testing is done with react-testing-library',
    author: 'Kent C. Dodds',
    url: 'https://testing-library.com/',
    likes: 7,
    user: {
      username: 'root',
      name: 'Superuser'
    }
  }

  const user = { username: 'root', name: 'Superuser' }

  let mockLike

  beforeEach(() => {
    mockLike = vi.fn()
    render(
      <Blog blog={blog} user={user} handleLike={mockLike} handleRemove={vi.fn()} />
    )
  })

  test('renders title and author but not url or likes by default', () => {
    expect(screen.getByText(blog.title, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(blog.author, { exact: false })).toBeInTheDocument()

    expect(screen.queryByText(blog.url)).toBeNull()
    expect(screen.queryByText('likes 7')).toBeNull()
  })

  test('url and likes are shown when the view button is clicked', async () => {
    const userAction = userEvent.setup()
    await userAction.click(screen.getByText('view'))

    expect(screen.getByText(blog.url)).toBeInTheDocument()
    expect(screen.getByText('likes 7')).toBeInTheDocument()
  })

  test('clicking the like button twice calls the event handler twice', async () => {
    const userAction = userEvent.setup()
    await userAction.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')
    await userAction.click(likeButton)
    await userAction.click(likeButton)

    expect(mockLike.mock.calls).toHaveLength(2)
  })
})
