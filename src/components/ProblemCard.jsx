import { useState } from 'react'
import SyntaxHighlighter from './SyntaxHighlighter'
import './ProblemCard.css'

function ProblemCard({ problem }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('algorithm')

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'difficulty-easy'
      case 'medium': return 'difficulty-medium'
      case 'hard': return 'difficulty-hard'
      default: return ''
    }
  }

  const formatCode = (code) => {
    return code.split('\\n').join('\n')
  }

  return (
    <div className="problem-card">
      <div className="problem-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="problem-title-row">
          <h3 className="problem-title">{problem.title}</h3>
          <span className={`difficulty ${getDifficultyClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="problem-meta">
          <span className="problem-topic">{problem.topic}</span>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="problem-content">
          <div className="problem-description">
            <p>{problem.description}</p>
          </div>

          <div className="content-tabs">
            <button 
              className={`tab ${activeTab === 'algorithm' ? 'active' : ''}`}
              onClick={() => setActiveTab('algorithm')}
            >
              Algorithm
            </button>
            <button 
              className={`tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
            <button 
              className={`tab ${activeTab === 'examples' ? 'active' : ''}`}
              onClick={() => setActiveTab('examples')}
            >
              Examples
            </button>
          </div>

          {activeTab === 'algorithm' && (
            <div className="algorithm-section">
              <div className="algorithm-approach">
                <h4>Approach: {problem.algorithm.approach}</h4>
                <div className="complexity-info">
                  <span className="complexity">Time: {problem.algorithm.timeComplexity}</span>
                  <span className="complexity">Space: {problem.algorithm.spaceComplexity}</span>
                </div>
              </div>
              <div className="algorithm-steps">
                <h5>Steps:</h5>
                <ol>
                  {problem.algorithm.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="code-section">
              <div className="code-header">
                <span className="language-tag">{problem.code.language.toUpperCase()}</span>
                <div className="code-actions">
                  <button 
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(formatCode(problem.code.solution))}
                    title="Copy code"
                  >
                    📋
                  </button>
                </div>
              </div>
              <SyntaxHighlighter 
                code={problem.code.solution} 
                language={problem.code.language}
              />
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="examples-section">
              {problem.examples.map((example, index) => (
                <div key={index} className="example">
                  <div className="example-input">
                    <strong>Input:</strong> {example.input}
                  </div>
                  <div className="example-output">
                    <strong>Output:</strong> {example.output}
                  </div>
                  <div className="example-explanation">
                    <strong>Explanation:</strong> {example.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProblemCard