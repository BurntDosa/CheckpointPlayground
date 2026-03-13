import { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ProblemList from './components/ProblemList'
import problemsData from './data/problems.json'
import './App.css'

function App() {
  const [problems, setProblems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading the problems data
    setTimeout(() => {
      setProblems(problemsData.problems)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading Amazon OA Problems...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🚀 Amazon OA Prep</h1>
          <p className="app-subtitle">Master coding interviews with curated problems and solutions</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <ProblemList problems={problems} searchTerm={searchTerm} />
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 Amazon OA Prep - Practice makes perfect! 💪</p>
      </footer>
    </div>
  )
}

export default App