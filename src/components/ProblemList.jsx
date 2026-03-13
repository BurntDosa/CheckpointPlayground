import ProblemCard from './ProblemCard'
import './ProblemList.css'

function ProblemList({ problems, searchTerm }) {
  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="problems-container">
      <div className="problems-header">
        <h2>Problems ({filteredProblems.length})</h2>
      </div>
      <div className="problems-list">
        {filteredProblems.length > 0 ? (
          filteredProblems.map(problem => (
            <ProblemCard key={problem.id} problem={problem} />
          ))
        ) : (
          <div className="no-results">
            <p>No problems found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProblemList