import { useState, useEffect } from 'react'
import axios from 'axios'
import Country from './components/Country'

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [shown, setShown] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setShown(null)
  }

  const filtered = countries.filter(c =>
    c.name.common.toLowerCase().includes(search.toLowerCase())
  )

  let result = null
  if (shown) {
    result = <Country country={shown} />
  } else if (search === '') {
    result = null
  } else if (filtered.length > 10) {
    result = <p>Too many matches, specify another filter</p>
  } else if (filtered.length === 1) {
    result = <Country country={filtered[0]} />
  } else {
    result = filtered.map(c =>
      <div key={c.cca3}>
        {c.name.common} <button onClick={() => setShown(c)}>show</button>
      </div>
    )
  }

  return (
    <div>
      find countries <input value={search} onChange={handleSearchChange} />
      {result}
    </div>
  )
}

export default App
