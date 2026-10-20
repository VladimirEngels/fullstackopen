import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const getLoggedUser = () => {
  const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
  if (!loggedUserJSON) {
    return null
  }

  const user = JSON.parse(loggedUserJSON)
  blogService.setToken(user.token)
  return user
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(getLoggedUser)
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  const showMessage = (text, error) => {
    setMessage(text)
    setIsError(error)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      return true
    } catch {
      showMessage('wrong username or password', true)
      return false
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const createBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      blogFormRef.current.toggleVisibility()
      setBlogs(blogs.concat(returnedBlog))
      showMessage(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`, false)
    } catch (error) {
      showMessage(error.response.data.error, true)
    }
  }

  const handleLike = async (blog) => {
    const changedBlog = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
    }

    const returnedBlog = await blogService.update(blog.id, changedBlog)
    setBlogs(blogs.map(b => b.id !== blog.id ? b : returnedBlog))
  }

  const handleRemove = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
        showMessage(`blog ${blog.title} removed`, false)
      } catch (error) {
        showMessage(error.response.data.error, true)
      }
    }
  }

  if (user === null) {
    return (
      <div>
        <Notification message={message} isError={isError} />
        <LoginForm handleLogin={handleLogin} />
      </div>
    )
  }

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message} isError={isError} />
      <p>
        {user.name} logged in
        <button onClick={handleLogout}>logout</button>
      </p>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>
      {sortedBlogs.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          user={user}
          handleLike={handleLike}
          handleRemove={handleRemove}
        />
      )}
    </div>
  )
}

export default App
