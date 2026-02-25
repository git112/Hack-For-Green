import { motion } from "framer-motion";
import { Wallet, Gift, Bus, Coffee, ShoppingBag, Ticket, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const rewards = [
  { 
    id: 1, 
    title: "Free Bus Ticket", 
    description: "One-way city bus travel",
    credits: 200, 
    icon: Bus,
    category: "Transport"
  },
  { 
    id: 2, 
    title: "Coffee Voucher", 
    description: "Free coffee at partner cafes",
    credits: 150, 
    icon: Coffee,
    category: "Food & Drink"
  },
  { 
    id: 3, 
    title: "Shopping Discount", 
    description: "10% off at eco-friendly stores",
    credits: 300, 
    icon: ShoppingBag,
    category: "Shopping"
  },
  { 
    id: 4, 
    title: "Movie Ticket", 
    description: "Single movie ticket",
    credits: 500, 
    icon: Ticket,
    category: "Entertainment"
  },
];

const transactions = [
  { type: "earned", amount: 50, description: "Report submitted", date: "Today" },
  { type: "earned", amount: 25, description: "Daily check-in", date: "Today" },
  { type: "spent", amount: 200, description: "Bus ticket redeemed", date: "Yesterday" },
  { type: "earned", amount: 100, description: "5 reports milestone", date: "2 days ago" },
];

export default function RewardsWallet() {
  const { toast } = useToast();
  const totalCredits = 450;

  const handleRedeem = (reward: typeof rewards[0]) => {
    if (totalCredits >= reward.credits) {
      toast({
        title: "Reward Redeemed! 🎉",
        description: `${reward.title} has been added to your account.`,
      });
    } else {
      toast({
        title: "Insufficient Credits",
        description: `You need ${reward.credits - totalCredits} more credits.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Rewards Wallet
        </h1>
        <p className="text-muted-foreground mt-1">
          Earn credits by contributing to cleaner air
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gradient-primary rounded-2xl p-6 text-primary-foreground"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm opacity-80">Total Balance</p>
            <p className="font-display text-3xl font-bold">{totalCredits} Credits</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" className="flex-1">
            <Gift className="w-4 h-4 mr-2" />
            Send Gift
          </Button>
          <Button variant="secondary" size="sm" className="flex-1">
            View History
          </Button>
        </div>
      </motion.div>

      {/* Available Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-semibold text-foreground mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <motion.div
              key={reward.id}
              whileHover={{ scale: 1.02 }}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <reward.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {reward.category}
                </span>
              </div>
              <h4 className="font-semibold text-foreground mb-1">{reward.title}</h4>
              <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-primary">{reward.credits} Credits</span>
                <Button 
                  size="sm" 
                  variant={totalCredits >= reward.credits ? "default" : "outline"}
                  onClick={() => handleRedeem(reward)}
                  disabled={totalCredits < reward.credits}
                  className={totalCredits >= reward.credits ? "gradient-primary border-0" : ""}
                >
                  Redeem
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">Recent Activity</h3>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.type === "earned" ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  <span className={tx.type === "earned" ? "text-success" : "text-destructive"}>
                    {tx.type === "earned" ? "+" : "-"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <span className={`font-semibold ${
                tx.type === "earned" ? "text-success" : "text-destructive"
              }`}>
                {tx.type === "earned" ? "+" : "-"}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
