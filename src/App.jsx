import { useEffect, useState } from 'react'
import './App.css'

const INITIAL_BATCH_SIZE = 24
const LOAD_MORE_STEP = 24

function App() {
  const [countries, setCountries] = useState([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://xcountries-backend.labs.crio.do/all')

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        setCountries(Array.isArray(data) ? data : [])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error(`Error fetching data: ${message}`)
        setError('Unable to load countries right now.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || error) {
        return
      }

      const scrollBottom = window.innerHeight + window.scrollY
      const pageHeight = document.documentElement.scrollHeight

      if (scrollBottom >= pageHeight - 200 && visibleCount < countries.length) {
        setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, countries.length))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [countries.length, error, isLoading, visibleCount])

  const visibleCountries = countries.slice(0, visibleCount)

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Explore the world</p>
        <h1>Country Flags</h1>
        <p className="subtitle">
          Scroll to reveal more flags and discover countries from around the globe.
        </p>
      </section>

      {isLoading ? (
        <p className="status-message">Loading countries...</p>
      ) : error ? (
        <p className="status-message error-state">{error}</p>
      ) : (
        <section className="country-grid" aria-label="Country flags gallery">
          {visibleCountries.map((country) => {
            const countryName = country.name || 'Country'

            return (
              <article className="country-card" key={country.abbr ?? countryName}>
                <img
                  src={country.flag}
                  alt={`${countryName} flag`}
                  className="country-flag"
                />
                <p className="country-name">{countryName}</p>
              </article>
            )
          })}
        </section>
      )}

      {!isLoading && !error && visibleCount < countries.length ? (
        <p className="status-message">Scroll down to see more flags.</p>
      ) : null}
    </main>
  )
}

export default App
