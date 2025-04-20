import { FeedbackEntry } from "@/app/interaction/page";

type FeedbackLogProps = {
  feedback: FeedbackEntry[];
};

export function FeedbackLog({ feedback }: FeedbackLogProps) {
  return (
    <div className="space-y-3 h-full overflow-y-auto">
      {feedback.map((entry, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg text-sm ${
            entry.type === "next_steps"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : entry.type === "question"
              ? "bg-green-50 text-green-800 border border-green-200"
              : entry.type === "answer"
              ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="font-medium capitalize">
              {entry.type === "next_steps"
                ? "Next Steps"
                : entry.type === "question"
                ? "Doctor Question"
                : entry.type === "answer"
                ? "AI Answer"
                : "System"}
            </span>
            <span className="text-xs text-gray-500">{entry.timestamp}</span>
          </div>
          <p className="mt-1">{entry.text}</p>
        </div>
      ))}
    </div>
  );
}
