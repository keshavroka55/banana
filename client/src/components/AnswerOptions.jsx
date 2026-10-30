// The four answer buttons.
// While the answer is being checked or after it was checked they are disabled,
// which (together with the server check) prevents answering twice.
export default function AnswerOptions({ options, selected, feedback, disabled, onSelect }) {
  const stateOf = (option) => {
    if (!feedback) return option === selected ? 'selected' : ''
    if (option === feedback.correctAnswer) return 'correct'
    if (option === selected) return 'wrong'
    return 'dimmed'
  }

  return (
    <div className="options" role="group" aria-label="Answer options">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`option ${stateOf(option)}`.trim()}
          disabled={disabled}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
