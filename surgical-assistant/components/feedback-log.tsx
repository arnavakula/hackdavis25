export function FeedbackLog() {
  // Sample feedback entries
  const feedbackEntries = [
    {
      id: 1,
      type: "system",
      message: "Surgery video analysis started",
      timestamp: "09:32:15",
    },
    {
      id: 2,
      type: "ai",
      message: "Identified surgical procedure: Laparoscopic cholecystectomy",
      timestamp: "09:32:18",
    },
    {
      id: 3,
      type: "warning",
      message: "Caution: Critical structure (common bile duct) in proximity",
      timestamp: "09:33:42",
    },
    {
      id: 4,
      type: "ai",
      message: "Suggestion: Consider adjusting instrument angle for better visualization",
      timestamp: "09:34:10",
    },
    {
      id: 5,
      type: "system",
      message: "Processing frame 1024/8192",
      timestamp: "09:35:22",
    },
    {
      id: 6,
      type: "ai",
      message: "Anatomy recognition complete. All structures identified with 98% confidence",
      timestamp: "09:36:05",
    },
  ]

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {feedbackEntries.map((entry) => (
        <div
          key={entry.id}
          className={`p-3 rounded-lg text-sm ${
            entry.type === "system"
              ? "bg-gray-100 text-gray-800"
              : entry.type === "warning"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="font-medium">
              {entry.type === "system" ? "System" : entry.type === "warning" ? "Warning" : "AI Assistant"}
            </span>
            <span className="text-xs text-gray-500">{entry.timestamp}</span>
          </div>
          <p className="mt-1">{entry.message}</p>
        </div>
      ))}
    </div>
  )
}
