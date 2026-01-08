"use client";
import { useState } from "react";

type ActionItem = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  completed: boolean;
};

type Category = {
  id: string;
  title: string;
  score: number;
  max: number;
  tip: string;
};

const demoData = {
  name: "You",
  score: 90,
  grade: "Excellent",
  summary: "You're doing great. Your finances are balanced across essentials, subscriptions, and discretionary spending.",
  categories: [
    { id: "ess", title: "Essentials Balance", score: 25, max: 30, tip: "Great job keeping essentials in check!" },
    { id: "subs", title: "Subscription Health", score: 15, max: 20, tip: "Subscription spending is well managed!" },
    { id: "buffer", title: "Spending Buffer", score: 25, max: 25, tip: "Healthy spending buffer maintained!" },
    { id: "flex", title: "Financial Flexibility", score: 25, max: 25, tip: "Good room for savings and fun!" },
  ],
  actions: [
    {
      id: "a1",
      priority: "high",
      title: "Review low-usage subscriptions",
      description: "Cancel or pause subscriptions you rarely use this month.",
      impact: "Save $40/month",
      completed: false,
    },
    {
      id: "a2",
      priority: "medium",
      title: "Reduce dining expenses",
      description: "Food & dining is high. Try meal prepping 2–3 days per week.",
      impact: "Save $120/month",
      completed: false,
    },
    {
      id: "a3",
      priority: "medium",
      title: "Implement a shopping pause",
      description: "Avoid discretionary purchases for 30 days.",
      impact: "Save $200/month",
      completed: false,
    },
    {
      id: "a4",
      priority: "low",
      title: "Grow emergency fund",
      description: "Move 20% of leftover cash into savings each month.",
      impact: "Build $1,200 in 6 months",
      completed: false,
    },
  ],
};

export default function ActionPlanPage() {
  const [actions, setActions] = useState<ActionItem[]>(demoData.actions);
  const [open, setOpen] = useState(true);

  const toggleComplete = (id: string) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const priorityStyles = (p: ActionItem["priority"]) => {
    if (p === "high") return "border-red-500 bg-red-50 text-red-700";
    if (p === "medium") return "border-yellow-500 bg-yellow-50 text-yellow-700";
    return "border-blue-500 bg-blue-50 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Action Plan → {demoData.name}
          </h1>
          <p className="text-slate-500 mt-1">
            Personalized financial insights based on your activity
          </p>
        </div>

        {/* Score Card */}
        <div className="rounded-3xl bg-white p-10 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Score Ring */}
            <div className="relative flex-shrink-0">
              <div className="h-44 w-44 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 p-[10px]">
                <div className="h-full w-full rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-5xl font-semibold text-slate-900">
                    {demoData.score}
                  </span>
                  <span className="text-sm text-slate-500">out of 100</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Financial Wellness Score
                </h2>
              </div>

              <p className="text-emerald-600 font-medium text-lg mb-2">
                {demoData.grade}
              </p>

              <p className="text-slate-600 max-w-lg">
                {demoData.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoData.categories.map(cat => {
            const percent = Math.round((cat.score / cat.max) * 100);
            return (
              <div
                key={cat.id}
                className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-900">{cat.title}</h3>
                  <span className="text-sm text-emerald-600 font-medium">
                    {cat.score} / {cat.max}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <p className="text-sm text-slate-500">{cat.tip}</p>
              </div>
            );
          })}
        </div>

        {/* Action Plan Section */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <div
            className="flex items-center justify-between cursor-pointer mb-6"
            onClick={() => setOpen(!open)}
          >
            <h2 className="text-xl font-semibold text-slate-900">
              Action Steps
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">
              {actions.length} items
            </span>
          </div>

          {open && (
            <div className="space-y-4">
              {actions.map(action => (
                <div
                  key={action.id}
                  className={`rounded-xl border-l-4 p-5 ${priorityStyles(action.priority)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white text-lg">
                      {action.priority === "high" && "⚡"}
                      {action.priority === "medium" && "📊"}
                      {action.priority === "low" && "💡"}
                    </div>

                    <div className="flex-1">
                      <span className="text-xs font-semibold uppercase">
                        {action.priority} priority
                      </span>
                      <h3 className="font-semibold text-slate-900 mt-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {action.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-600">
                          {action.impact}
                        </span>

                        <button
                          onClick={() => toggleComplete(action.id)}
                          className={`text-sm px-3 py-1 rounded-lg border ${
                            action.completed
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {action.completed ? "Completed" : "Mark Complete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
