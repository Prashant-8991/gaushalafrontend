import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Syringe,
  Stethoscope,
  Bug,
  Heart,
  Scale,
  Filter,
  Search,
} from "lucide-react";
import { alerts, Alert } from "../data/mockData";

const typeIcons: Record<string, { icon: typeof Syringe; color: string; bg: string }> = {
  Vaccination: { icon: Syringe, color: "text-saffron", bg: "bg-saffron/10" },
  "Health Check": { icon: Stethoscope, color: "text-navy", bg: "bg-navy/10" },
  Deworming: { icon: Bug, color: "text-green-600", bg: "bg-green-50" },
  Breeding: { icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
  "Weight Check": { icon: Scale, color: "text-purple-500", bg: "bg-purple-50" },
};

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  Pending: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
  Overdue: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: AlertTriangle },
  Completed: { color: "text-green-700", bg: "bg-green-50 border-green-200", icon: CheckCircle },
};

export function Alerts() {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [localAlerts, setLocalAlerts] = useState<Alert[]>(alerts);

  const filtered = localAlerts.filter((a) => {
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchType = filterType === "All" || a.type === filterType;
    const matchSearch =
      a.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const overdueCount = localAlerts.filter((a) => a.status === "Overdue").length;
  const pendingCount = localAlerts.filter((a) => a.status === "Pending").length;
  const completedCount = localAlerts.filter((a) => a.status === "Completed").length;

  const markComplete = (id: string) => {
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Completed" as const } : a))
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-saffron" />
            Alert Center
          </h1>
          <p style={{ fontSize: '0.85rem' }} className="text-muted-foreground mt-1">
            Track vaccinations, health checks, and other scheduled activities for your herd.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-red-700">{overdueCount}</p>
            <p style={{ fontSize: '0.75rem' }} className="text-red-500">Overdue</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-yellow-700">{pendingCount}</p>
            <p style={{ fontSize: '0.75rem' }} className="text-yellow-500">Pending</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-green-700">{completedCount}</p>
            <p style={{ fontSize: '0.75rem' }} className="text-green-500">Completed</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-saffron/10 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by cow or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted/50 border border-saffron/10 focus:outline-none focus:ring-2 focus:ring-saffron/30"
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
            style={{ fontSize: '0.85rem' }}
          >
            <option value="All">All Status</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-lg bg-muted/50 border border-saffron/10 appearance-none focus:outline-none focus:ring-2 focus:ring-saffron/30"
          style={{ fontSize: '0.85rem' }}
        >
          <option value="All">All Types</option>
          <option value="Vaccination">Vaccination</option>
          <option value="Health Check">Health Check</option>
          <option value="Deworming">Deworming</option>
          <option value="Breeding">Breeding</option>
          <option value="Weight Check">Weight Check</option>
        </select>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((alert, index) => {
            const typeInfo = typeIcons[alert.type] || typeIcons.Vaccination;
            const statusInfo = statusConfig[alert.status] || statusConfig.Pending;
            const StatusIcon = statusInfo.icon;
            const TypeIcon = typeInfo.icon;

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${alert.status === "Overdue"
                  ? "border-red-200 border-l-4 border-l-red-500"
                  : alert.status === "Completed"
                    ? "border-green-200 border-l-4 border-l-green-500"
                    : "border-saffron/10 border-l-4 border-l-yellow-400"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center shrink-0`}>
                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4>{alert.cowName}</h4>
                          <span
                            style={{ fontSize: '0.65rem' }}
                            className={`px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {alert.status}
                          </span>
                          <span
                            style={{ fontSize: '0.65rem' }}
                            className={`px-2 py-0.5 rounded-full ${alert.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : alert.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {alert.priority}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem' }} className="text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p style={{ fontSize: '0.7rem' }} className="text-muted-foreground">Due Date</p>
                          <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {new Date(alert.dueDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        {alert.status !== "Completed" && (
                          <button
                            onClick={() => markComplete(alert.id)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-colors"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span style={{ fontSize: '0.7rem' }} className={`${typeInfo.color}`}>
                        {alert.type}
                      </span>
                      <span style={{ fontSize: '0.7rem' }} className="text-muted-foreground">
                        Cow ID: {alert.cowId}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-saffron/10">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>All clear!</p>
            <p style={{ fontSize: '0.85rem' }} className="text-muted-foreground">No alerts matching your filters.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-saffron/10 p-5">
        <h3 className="mb-4">Vaccination Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-saffron/10">
                <th style={{ fontSize: '0.75rem' }} className="text-left py-2 text-muted-foreground">Vaccine</th>
                <th style={{ fontSize: '0.75rem' }} className="text-left py-2 text-muted-foreground">Frequency</th>
                <th style={{ fontSize: '0.75rem' }} className="text-left py-2 text-muted-foreground">Last Done</th>
                <th style={{ fontSize: '0.75rem' }} className="text-left py-2 text-muted-foreground">Next Due</th>
                <th style={{ fontSize: '0.75rem' }} className="text-left py-2 text-muted-foreground">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "FMD (Foot & Mouth)", freq: "Every 6 months", last: "Aug 2025", next: "Feb 2026", coverage: "80%" },
                { name: "HS-BQ", freq: "Annual", last: "Mar 2025", next: "Mar 2026", coverage: "90%" },
                { name: "Brucellosis", freq: "Once (calves)", last: "Dec 2025", next: "Jun 2026", coverage: "70%" },
                { name: "Theileriosis", freq: "As needed", last: "Oct 2025", next: "Apr 2026", coverage: "60%" },
                { name: "Deworming", freq: "Quarterly", last: "Nov 2025", next: "Feb 2026", coverage: "85%" },
              ].map((vaccine) => (
                <tr key={vaccine.name} className="border-b border-saffron/5 last:border-0">
                  <td style={{ fontSize: '0.85rem' }} className="py-3">{vaccine.name}</td>
                  <td style={{ fontSize: '0.8rem' }} className="py-3 text-muted-foreground">{vaccine.freq}</td>
                  <td style={{ fontSize: '0.8rem' }} className="py-3">{vaccine.last}</td>
                  <td style={{ fontSize: '0.8rem' }} className="py-3">{vaccine.next}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-saffron to-saffron-dark"
                          style={{ width: vaccine.coverage }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem' }} className="text-muted-foreground">{vaccine.coverage}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
