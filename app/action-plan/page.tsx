"use client";
import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import Navbar from "@/components/navbar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ActionItem = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  savingsAmount: number;
  completed: boolean;
};

type WellnessDataPoint = {
  name: string;
  score: number;
};

type Category = {
  id: string;
  title: string;
  score: number;
  max: number;
  tip: string;
};

type Subscription = {
  merchant: string;
  amount: number;
  daysUsed: number;
};

type Transaction = {
  amount: number;
  category?: string;
  merchant?: string;
  timestamp?: any;
};

type UserData = {
  monthlyIncome: number;
  essentialExpenses: number;
};

export default function ActionPlanPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [open, setOpen] = useState(true);
  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("Excellent");
  const [summary, setSummary] = useState("");
  const [wellnessHistory, setWellnessHistory] = useState<WellnessDataPoint[]>([]);
  const [milestone, setMilestone] = useState<string>("");
  const [spendingSpike, setSpendingSpike] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        // Fetch user data
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("uid", "==", currentUser.uid));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data() as UserData;
          setUserData(userData);
        }

        // Fetch transactions
        const transRef = collection(db, "transactions");
        const transQuery = query(transRef, where("userId", "==", currentUser.uid));
        const transSnap = await getDocs(transQuery);
        const transData = transSnap.docs.map(doc => doc.data() as Transaction);
        setTransactions(transData);

        // Fetch subscriptions
        const subsRef = collection(db, "subscriptions");
        const subsQuery = query(subsRef, where("userId", "==", currentUser.uid));
        const subsSnap = await getDocs(subsQuery);
        const subsData = subsSnap.docs.map(doc => doc.data() as Subscription);
        setSubscriptions(subsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Generate action items based on data
  useEffect(() => {
    if (!userData || transactions.length === 0) return;

    const generatedActions: ActionItem[] = [];
    const monthlyIncome = userData.monthlyIncome || 0;
    const essentialExpenses = userData.essentialExpenses || 0;

    // Analyze spending
    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const essentialsRatio = essentialExpenses / monthlyIncome;
    const discretionarySpent = totalSpent - essentialExpenses;
    const remainingBudget = monthlyIncome - totalSpent;

    // Detect spending spikes
    const avgDailySpend = totalSpent / 30;
    const recentSpending = transactions
      .filter(t => t.amount < 0)
      .slice(-10)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 10;
    
    if (recentSpending > avgDailySpend * 1.5) {
      setSpendingSpike(
        `Recent spending is ${((recentSpending / avgDailySpend - 1) * 100).toFixed(0)}% above average. Consider cutting back.`
      );
    } else {
      setSpendingSpike("");
    }

    // Action 1: Low-usage subscriptions (highest priority for savings)
    const lowUsageSubs = subscriptions.filter(s => s.daysUsed <= 4);
    if (lowUsageSubs.length > 0) {
      const savingsFromSubs = lowUsageSubs.reduce((sum, s) => sum + s.amount, 0);
      generatedActions.push({
        id: "a1",
        priority: "high",
        title: "Review low-usage subscriptions",
        description: `You have ${lowUsageSubs.length} subscription(s) with fewer than 5 days of usage. Consider canceling: ${lowUsageSubs.map(s => s.merchant).join(", ")}.`,
        impact: `Save $${savingsFromSubs.toFixed(0)}/month`,
        savingsAmount: savingsFromSubs,
        completed: false,
      });
    }

    // Action 2: High discretionary spending
    const discretionaryReduction = discretionarySpent * 0.1;
    if (discretionarySpent > monthlyIncome * 0.2) {
      generatedActions.push({
        id: "a2",
        priority: "medium",
        title: "Reduce discretionary spending",
        description: `Your discretionary spending is $${discretionarySpent.toFixed(0)}/month (${((discretionarySpent / monthlyIncome) * 100).toFixed(0)}% of income). Try reducing by 10%.`,
        impact: `Save $${discretionaryReduction.toFixed(0)}/month`,
        savingsAmount: discretionaryReduction,
        completed: false,
      });
    }

    // Action 3: Build emergency fund
    const emergencySavings = remainingBudget > 0 ? remainingBudget * 0.15 : 0;
    if (remainingBudget > 0) {
      generatedActions.push({
        id: "a3",
        priority: "low",
        title: "Grow emergency fund",
        description: `Set aside 10-20% of your surplus ($${emergencySavings.toFixed(0)}/month) for emergencies.`,
        impact: `Build $${(emergencySavings * 6).toFixed(0)} in 6 months`,
        savingsAmount: emergencySavings,
        completed: false,
      });
    } else {
      generatedActions.push({
        id: "a3",
        priority: "high",
        title: "Balance your budget",
        description: `You're spending more than your income. Review essentials and discretionary expenses to create a surplus.`,
        impact: `Achieve positive cash flow`,
        savingsAmount: 0,
        completed: false,
      });
    }

    // Sort actions by savings amount (highest first) - smart prioritization
    generatedActions.sort((a, b) => b.savingsAmount - a.savingsAmount);

    // Calculate score (same as dashboard)
    let calculatedScore = 100;
    if (essentialsRatio > 0.5) calculatedScore -= 15; // Too much on essentials
    if (discretionarySpent > monthlyIncome * 0.3) calculatedScore -= 20; // High discretionary
    if (remainingBudget < monthlyIncome * 0.1) calculatedScore -= 15; // Poor savings rate

    calculatedScore = Math.max(20, Math.min(100, calculatedScore));

    let calculatedGrade = "Excellent";
    if (calculatedScore >= 80) calculatedGrade = "Excellent";
    else if (calculatedScore >= 60) calculatedGrade = "Good";
    else if (calculatedScore >= 40) calculatedGrade = "Fair";
    else calculatedGrade = "Needs Improvement";

    let calculatedSummary = "";
    if (calculatedScore >= 80) {
      calculatedSummary = "You're doing well! Your finances are balanced and healthy.";
    } else if (remainingBudget > 0) {
      calculatedSummary = `You have ${generatedActions.length} action(s) to improve your financial health. Focus on the high-priority items first.`;
    } else {
      calculatedSummary = "Your spending exceeds your income. Review and adjust your budget accordingly.";
    }

    // Generate wellness history (simulate 7-day trend)
    const history: WellnessDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const daysAgo = i;
      const variance = Math.sin(daysAgo / 2) * 5 + (Math.random() - 0.5) * 3;
      const historicalScore = Math.max(20, Math.min(100, calculatedScore + variance));
      history.push({
        name: `Day ${7 - i}`,
        score: Math.round(historicalScore),
      });
    }
    setWellnessHistory(history);

    // Detect milestones
    const completedActions = generatedActions.filter(a => a.completed).length;
    if (completedActions === 1) setMilestone("🎉 Great start! You've completed your first action.");
    else if (completedActions === generatedActions.length) setMilestone("🏆 Excellent! You've completed all recommended actions.");
    else if (completedActions > 0) setMilestone(`✨ Progress! You've completed ${completedActions} of ${generatedActions.length} actions.`);
    else setMilestone("");

    setScore(calculatedScore);
    setGrade(calculatedGrade);
    setSummary(calculatedSummary);
    setActions(generatedActions.length > 0 ? generatedActions : []);
  }, [userData, transactions, subscriptions]);

  // Recompute milestone when actions change
  useEffect(() => {
    const completedActions = actions.filter(a => a.completed).length;
    if (completedActions === 1) setMilestone("🎉 Great start! You've completed your first action.");
    else if (completedActions === actions.length && actions.length > 0) setMilestone("🏆 Excellent! You've completed all recommended actions.");
    else if (completedActions > 0) setMilestone(`✨ Progress! You've completed ${completedActions} of ${actions.length} actions.`);
    else setMilestone("");
  }, [actions]);

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12 flex items-center justify-center">
          <p className="text-slate-500">Loading your action plan...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Action Plan
            </h1>
            <p className="text-slate-500 mt-1">
              Personalized financial insights based on your activity
            </p>
          </div>

          {/* Milestone Alert */}
          {milestone && (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 p-4 border border-emerald-200">
              <p className="text-emerald-800 font-medium">{milestone}</p>
            </div>
          )}

          {/* Spending Spike Alert */}
          {spendingSpike && (
            <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border border-yellow-200">
              <p className="text-yellow-800 font-medium">⚠️ {spendingSpike}</p>
            </div>
          )}

          {/* Score Card */}
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-slate-200">
            <div className="flex flex-col lg:flex-row items-center gap-10">

              {/* Score Ring */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={2 * Math.PI * 45 * (1 - score / 100)}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="flex flex-col items-center justify-center">
                  <span className="text-5xl font-semibold text-slate-900">
                    {Math.round(score)}
                  </span>
                  <span className="text-sm text-slate-500">out of 100</span>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Financial Wellness Score
                  </h2>
                </div>

                <p className="text-emerald-600 font-medium text-lg mb-2">
                  {grade}
                </p>

                <p className="text-slate-600 max-w-lg">
                  {summary}
                </p>
              </div>
            </div>
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
                {actions.length > 0 ? (
                  actions.map(action => (
                    <div
                      key={action.id}
                      className={`rounded-xl border-l-4 p-5 ${priorityStyles(action.priority)} ${action.completed ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={action.completed}
                          onChange={() => toggleComplete(action.id)}
                          className="w-5 h-5 mt-1 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-semibold uppercase">
                            {action.priority} priority
                          </span>
                          <h3 className={`font-semibold text-slate-900 mt-1 ${action.completed ? "line-through" : ""}`}>
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
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No actions needed - you're doing great!</p>
                )}
              </div>
            )}
          </div>

          {/* Wellness Graph */}
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Financial Wellness Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wellnessHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  formatter={(value) => [`${value}`, "Score"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>          </div>

        </div>
      </div>
    </>
  );
}