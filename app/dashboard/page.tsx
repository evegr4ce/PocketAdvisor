    "use client";

    import Navbar from "@/components/navbar";
    import MetricCard from "../../components/metricCard"

    import { useState, useMemo } from "react";

    // replace this mock data with function that gets data of the user from the database!!!!!!
    const transactions = [
        { id: 1, category: "Housing", amount: 1450 },
        { id: 2, category: "Food", amount: 420 },
        { id: 3, category: "Transportation", amount: 210 },
        { id: 4, category: "Subscriptions", amount: 85 },
        { id: 5, category: "Entertainment", amount: 160 },
        { id: 6, category: "Wellness", amount: 95 },
    ];
    const MONTHLY_INCOME = 4000;
    const SAFE_SPEND_RATIO = 0.5;


    export default function Dashboard () {
        const totalSpent = useMemo(
            () => transactions.reduce((sum, t) => sum + t.amount, 0),
            []
        );

        const safeToSpend = useMemo(
            () => MONTHLY_INCOME * SAFE_SPEND_RATIO - totalSpent,
            [totalSpent]
        );

        const spendingByCategory = useMemo(() => {
        const map: Record<string, number> = {};
        transactions.forEach((t) => {
            map[t.category] = (map[t.category] || 0) + t.amount;
        });
        return map;
        }, []);

        const wellnessScore = useMemo(() => {
        const ratio = totalSpent / MONTHLY_INCOME;
            if (ratio < 0.4) return 90;
            if (ratio < 0.6) return 75;
            if (ratio < 0.8) return 55;
            return 35;
        }, [totalSpent]);


        return (
            <div className="min-h-screen bg-white text-black p-6">
            <Navbar></Navbar>
            <h1 className="text-3xl font-semibold mb-6 pt-10">Financial Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Month-to-date Spend"
                    value={`$${totalSpent.toLocaleString()}`}
                />
                <MetricCard
                    title="Safe to Spend"
                    value={`$${Math.max(safeToSpend, 0).toLocaleString()}`}
                />
                <MetricCard
                    title="Monthly Income"
                    value={`$${MONTHLY_INCOME.toLocaleString()}`}
                />
                <MetricCard
                    title="Wellness Score"
                    value={`${wellnessScore}/100`}
                />
            </div>

            <div className="bg-white shadow-xl rounded-2xl p-6">
                <h2 className="text-xl font-medium mb-4">Spending by Category</h2>
                <div className="space-y-3">
                    {Object.entries(spendingByCategory).map(([category, amount]) => {
                    const percent = (amount / totalSpent) * 100;
                    return (
                        <div key={category}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{category}</span>
                                <span>${amount}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-300 rounded">
                                <div className="h-2 bg-green-500 rounded" style={{ width: `${percent}%` }}/>
                            </div>
                        </div>
                    );
                    })}
                    </div>
                </div>
            </div>
        );
    }