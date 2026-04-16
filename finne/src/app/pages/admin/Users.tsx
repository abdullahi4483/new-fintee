import {
  Search,
  Filter,
  MoreVertical,
  X,
  User,
  Mail,
  DollarSign,
  Calendar,
  CreditCard,
  Shield,
  Edit,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Dashboard } from "../dashboard/DashboardOverview";

interface UserType {
  id: number;
  name: string;
  email: string;
  balance: number;
  status: "Active" | "Suspended";
  joined: string;
  accountType?: string;
}

export function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModall, setShowAddModall] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Add User Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [status, setStatus] = useState<"Active" | "Suspended">("Active");

  const users: UserType[] = [
    {
      id: 1,
      name: "John Anderson",
      email: "john@example.com",
      balance: 125430,
      status: "Active",
      joined: "2025-01-15",
      accountType: "Premium",
    },
    {
      id: 2,
      name: "Sarah Williams",
      email: "sarah@example.com",
      balance: 89250,
      status: "Active",
      joined: "2025-02-20",
      accountType: "Standard",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      balance: 45680,
      status: "Suspended",
      joined: "2024-11-10",
      accountType: "Standard",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily@example.com",
      balance: 156890,
      status: "Active",
      joined: "2024-12-05",
      accountType: "Premium",
    },
    {
      id: 5,
      name: "Tom Brown",
      email: "tom@example.com",
      balance: 32100,
      status: "Active",
      joined: "2026-01-08",
      accountType: "Basic",
    },
    {
      id: 6,
      name: "Lisa Garcia",
      email: "lisa@example.com",
      balance: 98450,
      status: "Active",
      joined: "2025-03-12",
      accountType: "Premium",
    },
    {
      id: 7,
      name: "David Martinez",
      email: "david@example.com",
      balance: 67230,
      status: "Suspended",
      joined: "2025-01-28",
      accountType: "Standard",
    },
    {
      id: 8,
      name: "Jessica Wilson",
      email: "jessica@example.com",
      balance: 142000,
      status: "Active",
      joined: "2024-10-15",
      accountType: "Premium",
    },
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !initialBalance) {
      alert("Please fill in all fields");
      return;
    }
    // In a real app, this would make an API call
    console.log("Adding user:", {
      firstName,
      lastName,
      email,
      initialBalance,
      status,
    });
    // Reset form
    setFirstName("");
    setLastName("");
    setEmail("");
    setInitialBalance("");
    setStatus("Active");
    setShowAddModall(false);
  };

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setShowViewModal(true);
    setOpenDropdown(null);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    const [first, ...last] = user.name.split(" ");
    setFirstName(first);
    setLastName(last.join(" "));
    setEmail(user.email);
    setInitialBalance(user.balance.toString());
    setStatus(user.status);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !initialBalance) {
      alert("Please fill in all fields");
      return;
    }
    // In a real app, this would make an API call
    console.log("Updating user:", {
      id: selectedUser?.id,
      firstName,
      lastName,
      email,
      balance: initialBalance,
      status,
    });
    // Reset form
    setFirstName("");
    setLastName("");
    setEmail("");
    setInitialBalance("");
    setStatus("Active");
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const confirmDelete = () => {
    // In a real app, this would make an API call
    console.log("Deleting user:", selectedUser?.id);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-8">
        <h1
          className="font-heading mb-2"
          style={{ fontSize: "36px", color: "#ffffff" }}
        >
          Users Management
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Manage all user accounts
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#141e32]/60 backdrop-blur-xl border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowAddModall(true)}
          className="px-6 py-3 rounded-lg bg-[#c9a84c] text-[#0a0e1a] hover:bg-[#b89640] transition-all hover:scale-105"
        >
          Add User
        </button>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  className="text-left p-4"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Name
                </th>
                <th
                  className="text-left p-4"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Email
                </th>
                <th
                  className="text-right p-4"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Balance
                </th>
                <th
                  className="text-center p-4"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Status
                </th>
                <th
                  className="text-center p-4"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Joined
                </th>
                <th
                  className="text-center p-4"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  <td className="p-4" style={{ color: "#ffffff" }}>
                    {user.name}
                  </td>
                  <td
                    className="p-4"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {user.email}
                  </td>
                  <td className="p-4 text-right" style={{ color: "#c9a84c" }}>
                    ${user.balance.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        user.status === "Active"
                          ? "bg-[#10b981]/20 text-[#10b981]"
                          : "bg-[#ef4444]/20 text-[#ef4444]"
                      }`}
                      style={{ fontSize: "14px" }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td
                    className="p-4 text-center"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {user.joined}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="px-3 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30 transition-all text-sm"
                      >
                        View
                      </button>
                      <button className="px-3 py-1 rounded bg-[#c9a84c]/20 text-[#c9a84c] hover:bg-[#c9a84c]/30 transition-all text-sm">
                        {user.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === user.id ? null : user.id,
                            )
                          }
                          className="p-2 rounded hover:bg-white/10 transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-white/60" />
                        </button>
                        {openDropdown === user.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute right-0 mt-2 w-48 rounded-lg bg-[#141e32] border border-[#c9a84c]/20 shadow-xl z-20"
                            >
                              <button
                                onClick={() => handleEditUser(user)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/10 transition-all rounded-t-lg"
                              >
                                <Edit className="w-4 h-4 text-[#3b82f6]" />
                                <span>Edit User</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#ef4444] hover:bg-white/10 transition-all rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete User</span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModall(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="relative w-full max-w-2xl p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
                <button
                  onClick={() => setShowAddModall(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="mb-6">
                  <h2
                    className="font-heading mb-2"
                    style={{ fontSize: "28px", color: "#ffffff" }}
                  >
                    Add New User
                  </h2>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    Create a new user account
                  </p>
                </div>

                <form onSubmit={handleAddUser} className="space-y-4">
                  {/* Name Fields - 2 Column Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block mb-2"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label
                        className="block mb-2"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Initial Balance */}
                  <div>
                    <label
                      className="block mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Initial Balance
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="number"
                        value={initialBalance}
                        onChange={(e) =>
                          setInitialBalance(Number(e.target.value))
                        }
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      className="block mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "Active" | "Suspended")
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {showViewModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowViewModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="relative w-full max-w-2xl p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                {/* User Avatar & Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a84c] to-[#b89640] flex items-center justify-center">
                    <span
                      className="font-heading"
                      style={{ fontSize: "32px", color: "#0a0e1a" }}
                    >
                      {getInitials(selectedUser.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2
                      className="font-heading mb-2"
                      style={{ fontSize: "28px", color: "#ffffff" }}
                    >
                      {selectedUser.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          selectedUser.status === "Active"
                            ? "bg-[#10b981]/20 text-[#10b981]"
                            : "bg-[#ef4444]/20 text-[#ef4444]"
                        }`}
                        style={{ fontSize: "14px" }}
                      >
                        {selectedUser.status}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full bg-[#3b82f6]/20 text-[#3b82f6]"
                        style={{ fontSize: "14px" }}
                      >
                        {selectedUser.accountType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balance Card */}
                <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#c9a84c]/20 to-[#b89640]/10 border border-[#c9a84c]/30">
                  <div
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.6)",
                      marginBottom: "8px",
                    }}
                  >
                    Account Balance
                  </div>
                  <div
                    className="font-heading"
                    style={{ fontSize: "40px", color: "#c9a84c" }}
                  >
                    $
                    {selectedUser.balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {/* Account Metadata */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Shield className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: "14px",
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        User ID
                      </div>
                      <div style={{ color: "#ffffff" }}>
                        #{String(selectedUser.id).padStart(6, "0")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Mail className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: "14px",
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        Email
                      </div>
                      <div style={{ color: "#ffffff" }}>
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <Calendar className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: "14px",
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        Joined Date
                      </div>
                      <div style={{ color: "#ffffff" }}>
                        {selectedUser.joined}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5">
                    <CreditCard className="w-5 h-5 text-[#c9a84c]" />
                    <div className="flex-1">
                      <div
                        style={{
                          fontSize: "14px",
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        Account Type
                      </div>
                      <div style={{ color: "#ffffff" }}>
                        {selectedUser.accountType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button className="flex-1 px-6 py-3 border border-[#c9a84c]/40 text-[#c9a84c] rounded-lg hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all">
                    Edit User
                  </button>
                  <button className="flex-1 px-6 py-3 border border-[#ef4444]/40 text-[#ef4444] rounded-lg hover:border-[#ef4444] hover:bg-[#ef4444]/10 transition-all">
                    {selectedUser.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                  <button className="flex-1 px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all hover:scale-105">
                    Close Account
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="relative w-full max-w-2xl p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#c9a84c]/40 shadow-2xl">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="mb-6">
                  <h2
                    className="font-heading mb-2"
                    style={{ fontSize: "28px", color: "#ffffff" }}
                  >
                    Edit User
                  </h2>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    Update user account information
                  </p>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-4">
                  {/* Name Fields - 2 Column Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block mb-2"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label
                        className="block mb-2"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Balance */}
                  <div>
                    <label
                      className="block mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Account Balance
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="number"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      className="block mb-2"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "Active" | "Suspended")
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-6 py-3 border border-[#c9a84c]/40 text-white rounded-lg hover:border-[#c9a84c] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-[#141e32]/95 to-[#0a0e1a]/95 backdrop-blur-xl border border-[#ef4444]/40 shadow-2xl">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#ef4444]/20 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-[#ef4444]" />
                  </div>

                  <h2
                    className="font-heading mb-4"
                    style={{ fontSize: "28px", color: "#ffffff" }}
                  >
                    Delete User
                  </h2>

                  <p
                    className="mb-2"
                    style={{
                      fontSize: "16px",
                      color: "rgba(255, 255, 255, 0.7)",
                      lineHeight: "1.6",
                    }}
                  >
                    Are you sure you want to delete{" "}
                    <span className="text-[#c9a84c]">{selectedUser.name}</span>?
                  </p>

                  <p
                    className="mb-8"
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.5)",
                      lineHeight: "1.6",
                    }}
                  >
                    This action cannot be undone. All user data and transaction
                    history will be permanently removed.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-6 py-3 border border-white/20 text-white rounded-lg hover:border-white/40 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="flex-1 px-6 py-3 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-all hover:scale-105"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
