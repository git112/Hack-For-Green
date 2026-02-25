import { motion } from "framer-motion";
import { ArrowLeft, Filter, Download, Search, TrendingUp, TrendingDown, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";

const allTransactions = [
    { id: 1, type: "earned", amount: 50, description: "AI Report: Industrial Smoke Detection", category: "Report", date: "2024-02-25 14:30", status: "Completed" },
    { id: 2, type: "earned", amount: 25, description: "Daily Clean Air Check-in", category: "Daily", date: "2024-02-25 09:15", status: "Completed" },
    { id: 3, type: "spent", amount: 200, description: "Redeemed: Free Bus Ticket", category: "Redemption", date: "2024-02-24 18:45", status: "Completed" },
    { id: 4, type: "earned", amount: 100, description: "Milestone: 5 Accurate Reports", category: "Achievement", date: "2024-02-23 20:10", status: "Completed" },
    { id: 5, type: "earned", amount: 50, description: "AI Report: Construction Dust", category: "Report", date: "2024-02-22 11:20", status: "Completed" },
    { id: 6, type: "spent", amount: 150, description: "Redeemed: Coffee Voucher", category: "Redemption", date: "2024-02-21 16:00", status: "Completed" },
    { id: 7, type: "earned", amount: 50, description: "AI Report: Open Waste Burning", category: "Report", date: "2024-02-20 13:45", status: "Completed" },
    { id: 8, type: "earned", amount: 30, description: "Community Clean Drive Participant", category: "Event", date: "2024-02-19 10:00", status: "Completed" },
];

export default function WalletHistory() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTransactions = allTransactions.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link to="/citizen/wallet" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Wallet
                    </Link>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                        Transaction History
                    </h1>
                </motion.div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-10 rounded-xl">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-success/10 text-success">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground text-success">+805 Credits</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground text-destructive">-350 Credits</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground text-primary">455 Credits</p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
                <div className="p-4 border-b border-border bg-muted/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            className="pl-10 bg-background border-border rounded-xl h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-foreground">{tx.description}</p>
                                        <p className="text-xs text-muted-foreground">ID: #TX-00{tx.id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {tx.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center text-xs font-bold text-success">
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-display font-bold ${tx.type === "earned" ? "text-success" : "text-destructive"}`}>
                                            {tx.type === "earned" ? "+" : "-"}{tx.amount}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No transactions found matching your search.
                    </div>
                )}
            </motion.div>
        </div>
    );
}
