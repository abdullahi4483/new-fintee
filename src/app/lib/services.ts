import {
  ApiError,
  apiRequest,
  formatApiDate,
  loadSession,
  pickArray,
  pickObject,
  readNumber,
  readString,
  unwrapData,
} from "./api";

const ADMIN_USERS_STORAGE_KEY = "fintech.admin.users";

export interface SummaryMetric {
  label: string;
  value: string;
  change?: string;
}

export interface AccountRecord {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  growth: string;
  accountNumber: string;
}

export interface TransactionRecord {
  id: string;
  user?: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  description: string;
}

export interface CardRecord {
  id: string;
  cardHolder: string;
  last4: string;
  expiry: string;
  cvv: string;
  type: string;
  brand: string;
  spendingLimit: number;
  currentUsage: number;
  currency: string;
  frozen: boolean;
}

export interface SupportMessageRecord {
  id: string;
  user: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  date: string;
}

export interface ProfileSettings {
  fullName: string;
  email: string;
}

export interface AdminSettingsRecord {
  platformName: string;
  supportEmail: string;
  adminEmail: string;
  emailNotifications: boolean;
  withdrawalManualThreshold: string;
  autoApproveEnabled: boolean;
  autoApproveMaxAmount: string;
  sessionTimeoutMinutes: number;
  apiRateLimitPerHour: number;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  status: string;
  joined: string;
}

function toCurrency(value: unknown, fallback = "USD") {
  const raw = readString(value, fallback);
  return raw.toUpperCase();
}

function toMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function upper(value: unknown, fallback = "Unknown") {
  const text = readString(value, fallback);
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapAccount(raw: Record<string, unknown>, index = 0): AccountRecord {
  const balance = readNumber(raw.balance ?? raw.availableBalance ?? raw.amount);
  const currency = toCurrency(raw.currency);
  return {
    id: readString(raw.id ?? raw._id ?? raw.accountId, `account-${index + 1}`),
    name: readString(raw.name ?? raw.accountName, `Account ${index + 1}`),
    type: upper(raw.type, "Account"),
    balance,
    currency,
    growth: readString(raw.growth ?? raw.change ?? raw.performance ?? "0%"),
    accountNumber: readString(raw.accountNumber ?? raw.maskedAccountNumber ?? raw.number, "N/A"),
  };
}

function mapTransaction(raw: Record<string, unknown>, index = 0): TransactionRecord {
  return {
    id: readString(raw.id ?? raw._id ?? raw.transactionId, `txn-${index + 1}`),
    user: readString(
      (raw.user as Record<string, unknown> | undefined)?.fullName ??
        (raw.user as Record<string, unknown> | undefined)?.name ??
        raw.userName,
    ),
    date: formatApiDate(raw.createdAt ?? raw.date ?? raw.updatedAt),
    amount: readNumber(raw.amount),
    type: upper(raw.type, "Transaction"),
    status: upper(raw.status, "Unknown"),
    description: readString(raw.description ?? raw.narration ?? raw.reference ?? raw.type, "Transaction"),
  };
}

function mapCard(raw: Record<string, unknown>, index = 0): CardRecord {
  const spendingLimit = readNumber(raw.spendingLimit ?? raw.limit ?? raw.monthlyLimit);
  const currentUsage = readNumber(raw.currentUsage ?? raw.usedAmount ?? raw.spentAmount);
  return {
    id: readString(raw.id ?? raw._id ?? raw.cardId, `card-${index + 1}`),
    cardHolder: readString(raw.cardHolder ?? raw.holderName ?? raw.name, "Card Holder"),
    last4: readString(raw.last4 ?? raw.lastFour ?? raw.maskedNumber, "0000").slice(-4),
    expiry: readString(raw.expiryDate ?? raw.expiry ?? raw.expiresAt, "12/30"),
    cvv: readString(raw.cvv ?? raw.cvc ?? "***", "***"),
    type: upper(raw.type ?? raw.cardType, "Virtual"),
    brand: upper(raw.brand ?? raw.network, "Card"),
    spendingLimit,
    currentUsage,
    currency: toCurrency(raw.currency),
    frozen: Boolean(raw.isFrozen ?? raw.frozen ?? raw.status === "FROZEN"),
  };
}

function mapSupportMessage(raw: Record<string, unknown>, index = 0): SupportMessageRecord {
  const user = (raw.user as Record<string, unknown> | undefined) || {};
  return {
    id: readString(raw.id ?? raw._id ?? raw.messageId, `message-${index + 1}`),
    user: readString(user.fullName ?? user.name ?? raw.userName, "Customer"),
    email: readString(user.email ?? raw.email, "N/A"),
    category: upper(raw.category, "General"),
    subject: readString(raw.subject, "Support Request"),
    message: readString(raw.message ?? raw.body, ""),
    status: upper(raw.status, "Pending"),
    date: formatApiDate(raw.createdAt ?? raw.date ?? raw.updatedAt),
  };
}

function mapAdminSettings(raw: Record<string, unknown>): AdminSettingsRecord {
  return {
    platformName: readString(raw.platformName, "Fintech"),
    supportEmail: readString(raw.supportEmail, "support@fintech.com"),
    adminEmail: readString(raw.adminEmail, "admin@fintech.com"),
    emailNotifications: Boolean(raw.emailNotifications ?? raw.notificationsEnabled ?? raw.sendAdminEmails),
    withdrawalManualThreshold: String(raw.withdrawalManualThreshold ?? "10000"),
    autoApproveEnabled: Boolean(raw.autoApproveEnabled),
    autoApproveMaxAmount: String(raw.autoApproveMaxAmount ?? "1000"),
    sessionTimeoutMinutes: readNumber(raw.sessionTimeoutMinutes, 30),
    apiRateLimitPerHour: readNumber(raw.apiRateLimitPerHour, 1000),
  };
}

function loadStoredAdminUsers() {
  if (typeof window === "undefined") {
    return [] as AdminUserRecord[];
  }

  const raw = window.localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
  if (!raw) {
    return [] as AdminUserRecord[];
  }

  try {
    const parsed = JSON.parse(raw) as AdminUserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as AdminUserRecord[];
  }
}

function findCurrentClientOverride() {
  const session = loadSession();
  const storedUsers = loadStoredAdminUsers();

  return (
    storedUsers.find((user) => {
      if (session?.user?.id && user.id === session.user.id) {
        return true;
      }

      if (session?.user?.email && user.email.toLowerCase() === session.user.email.toLowerCase()) {
        return true;
      }

      return false;
    }) ?? null
  );
}

function applyClientBalanceOverrideToAccounts(accounts: AccountRecord[]) {
  const override = findCurrentClientOverride();
  if (!override || accounts.length === 0) {
    return accounts;
  }

  return accounts.map((account, index) =>
    index === 0
      ? {
          ...account,
          balance: override.balance,
        }
      : account,
  );
}

export const authService = {
  changePassword(input: { currentPassword: string; newPassword: string }) {
    void input;
    throw new ApiError("Password updates are not exposed by the current API.", 400, null);
  },
};

export const customerService = {
  async getDashboardSummary() {
    const payload = await apiRequest("/dashboard/summary");
    const summary = pickObject<Record<string, unknown>>(payload, ["summary", "dashboard"]);

    const accounts = applyClientBalanceOverrideToAccounts(
      pickArray<Record<string, unknown>>(payload, ["accounts"]).map(mapAccount),
    );
    const recentTransactions = pickArray<Record<string, unknown>>(payload, [
      "recentTransactions",
      "transactions",
    ]).map(mapTransaction);
    const override = findCurrentClientOverride();

    return {
      greetingName: readString(
        override?.name ?? summary.fullName ?? summary.name ?? summary.userName,
        "Customer",
      ),
      totalBalance: override?.balance ?? readNumber(summary.totalBalance ?? summary.balance),
      balanceChange: readString(summary.balanceChange ?? summary.change ?? "0%"),
      totalSpent: readNumber(summary.totalSpent ?? summary.monthlySpend),
      currency: toCurrency(summary.currency),
      accounts,
      recentTransactions,
    };
  },
  async getAccounts() {
    const payload = await apiRequest("/accounts");
    return applyClientBalanceOverrideToAccounts(
      pickArray<Record<string, unknown>>(payload, ["accounts"]).map(mapAccount),
    );
  },
  async getTransactions() {
    const payload = await apiRequest("/transactions?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["transactions"]).map(mapTransaction);
  },
  async getCards() {
    const payload = await apiRequest("/cards");
    return pickArray<Record<string, unknown>>(payload, ["cards"]).map(mapCard);
  },
  freezeCard(cardId: string) {
    return apiRequest(`/cards/${cardId}/freeze`, { method: "PATCH" });
  },
  createWithdrawal(input: { amount: string; accountNumber: string; bankCode: string }) {
    return apiRequest("/withdrawals", {
      method: "POST",
      body: {
        amount: Number(input.amount),
        accountNumber: input.accountNumber,
        bankCode: input.bankCode,
      },
    });
  },
  async getWithdrawals() {
    const payload = await apiRequest("/withdrawals?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["withdrawals"]).map((raw, index) => ({
      id: readString(raw.id ?? raw._id ?? raw.withdrawalId, `withdrawal-${index + 1}`),
      amount: readNumber(raw.amount),
      currency: toCurrency(raw.currency),
      status: upper(raw.status, "Pending"),
      date: formatApiDate(raw.createdAt ?? raw.date),
      accountId: readString(raw.accountId),
    }));
  },
  async getSupportMessages() {
    const payload = await apiRequest("/support/messages?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["messages"]).map(mapSupportMessage);
  },
  sendSupportMessage(input: { subject: string; message: string }) {
    return apiRequest("/support/messages", {
      method: "POST",
      body: {
        subject: input.subject,
        message: input.message,
      },
    });
  },
  async getProfile() {
    const session = loadSession();
    return {
      fullName: readString(session?.user?.fullName),
      email: readString(session?.user?.email),
    } satisfies ProfileSettings;
  },
  updateProfile(input: ProfileSettings) {
    return apiRequest("/settings/profile", {
      method: "PATCH",
      body: {
        fullName: input.fullName,
        email: input.email,
      },
    });
  },
};

export const adminService = {
  async getDashboardSummary() {
    const [users, withdrawals, messages] = await Promise.all([
      this.getUsers(),
      this.getWithdrawals(),
      this.getMessages().catch(() => []),
    ]);

    const pendingWithdrawals = withdrawals.filter((item) => item.status === "Pending");
    const metrics = [
      { label: "Total Users", value: String(users.length), change: "" },
      { label: "Support Tickets", value: String(messages.length), change: "" },
      { label: "Pending Withdrawals", value: String(pendingWithdrawals.length), change: "" },
      {
        label: "Pending Amount",
        value: toMoney(
          pendingWithdrawals.reduce((sum, item) => sum + item.amount, 0),
        ),
        change: "",
      },
    ];

    const activity = [
      ...withdrawals.slice(0, 5).map((item) => ({
        id: `withdrawal-${item.id}`,
        user: item.user,
        action: `Withdrawal ${item.status.toLowerCase()}`,
        amount: toMoney(item.amount),
        time: item.date,
      })),
      ...messages.slice(0, 5).map((item) => ({
        id: `message-${item.id}`,
        user: item.user,
        action: item.subject,
        amount: item.status,
        time: item.date,
      })),
    ].slice(0, 6);

    return {
      metrics,
      recentActivity: activity,
    };
  },
  async getUsers() {
    const payload = await apiRequest("/admin/users?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["users"]).map((raw, index) => ({
      id: readString(raw.id ?? raw._id ?? raw.userId, `user-${index + 1}`),
      name: readString(raw.fullName ?? raw.name, "User"),
      email: readString(raw.email),
      phone: readString(raw.phone),
      balance: readNumber(raw.balance ?? raw.totalBalance),
      status: upper(raw.status, "Unknown"),
      joined: formatApiDate(raw.createdAt ?? raw.joinedAt),
    })) as AdminUserRecord[];
  },
  async getUserById(userId: string) {
    const users = await this.getUsers();
    return users.find((user) => user.id === userId) ?? null;
  },
  updateUser(
    userId: string,
    input: { fullName: string; email: string; phone: string; amount: string },
  ) {
    void userId;
    void input;
    throw new ApiError("User profile edits are not exposed by the current admin API.", 400, null);
  },
  updateUserStatus(userId: string, status: string) {
    return apiRequest(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
  createUser(input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    balance: string;
  }) {
    const names = input.fullName.trim().split(/\s+/).filter(Boolean);
    return apiRequest("/auth/signup", {
      method: "POST",
      auth: false,
      body: {
        email: input.email,
        password: input.password,
        fullName: names.join(" ") || input.fullName.trim(),
      },
    });
  },
  async getTransactions() {
    const payload = await apiRequest("/transactions?page=1&pageSize=50");
    return pickArray<Record<string, unknown>>(payload, ["transactions"]).map(mapTransaction);
  },
  async getWithdrawals() {
    const payload = await apiRequest("/admin/withdrawals?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["withdrawals"]).map((raw, index) => ({
      id: readString(raw.id ?? raw._id ?? raw.withdrawalId, `withdrawal-${index + 1}`),
      user: readString((raw.user as Record<string, unknown> | undefined)?.fullName ?? raw.userName, "Customer"),
      email: readString((raw.user as Record<string, unknown> | undefined)?.email ?? raw.email),
      amount: readNumber(raw.amount),
      date: formatApiDate(raw.createdAt ?? raw.date),
      status: upper(raw.status, "Pending"),
    }));
  },
  approveWithdrawal(withdrawalId: string) {
    return apiRequest(`/admin/withdrawals/${withdrawalId}/approve`, { method: "PATCH" });
  },
  rejectWithdrawal(withdrawalId: string, reason: string) {
    return apiRequest(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: "PATCH",
      body: { reason },
    });
  },
  async getMessages() {
    const payload = await apiRequest("/admin/messages?page=1&pageSize=20");
    return pickArray<Record<string, unknown>>(payload, ["messages"]).map(mapSupportMessage);
  },
  replyToMessage(messageId: string, body: string) {
    return apiRequest(`/admin/messages/${messageId}/reply`, {
      method: "POST",
      body: { message: body },
    });
  },
  async getSettings() {
    return mapAdminSettings({});
  },
  updateSettings(input: AdminSettingsRecord) {
    void input;
    throw new ApiError("Admin settings are not exposed by the current API.", 400, null);
  },
};

export const formatters = {
  money: toMoney,
  status: upper,
  date: formatApiDate,
};
