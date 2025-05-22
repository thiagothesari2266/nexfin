import { pgTable, text, serial, integer, boolean, timestamp, decimal, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["personal", "business"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  date: date("date").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  paymentMethod: text("payment_method"),
  // Business account specific fields
  clientName: text("client_name"),
  projectName: text("project_name"),
  costCenter: text("cost_center"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditCards = pgTable("credit_cards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  lastFourDigits: text("last_four_digits").notNull(),
  brand: text("brand").notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).notNull(),
  dueDate: integer("due_date").notNull(), // Day of month (1-31)
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditCardTransactions = pgTable("credit_card_transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  installments: integer("installments").default(1).notNull(),
  currentInstallment: integer("current_installment").default(1).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  creditCardId: integer("credit_card_id").references(() => creditCards.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  // Business account specific fields
  clientName: text("client_name"),
  projectName: text("project_name"),
  costCenter: text("cost_center"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const accountsRelations = relations(accounts, ({ many }) => ({
  categories: many(categories),
  transactions: many(transactions),
  creditCards: many(creditCards),
  creditCardTransactions: many(creditCardTransactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  account: one(accounts, {
    fields: [categories.accountId],
    references: [accounts.id],
  }),
  transactions: many(transactions),
  creditCardTransactions: many(creditCardTransactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
  account: one(accounts, {
    fields: [creditCards.accountId],
    references: [accounts.id],
  }),
  transactions: many(creditCardTransactions),
}));

export const creditCardTransactionsRelations = relations(creditCardTransactions, ({ one }) => ({
  account: one(accounts, {
    fields: [creditCardTransactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [creditCardTransactions.categoryId],
    references: [categories.id],
  }),
  creditCard: one(creditCards, {
    fields: [creditCardTransactions.creditCardId],
    references: [creditCards.id],
  }),
}));

// Insert schemas
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertCreditCardSchema = createInsertSchema(creditCards).omit({
  id: true,
  createdAt: true,
});

export const insertCreditCardTransactionSchema = createInsertSchema(creditCardTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type CreditCardTransaction = typeof creditCardTransactions.$inferSelect;
export type InsertCreditCardTransaction = z.infer<typeof insertCreditCardTransactionSchema>;

// Extended types for API responses
export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type CreditCardTransactionWithCategory = CreditCardTransaction & {
  category: Category;
};

export type CreditCardWithTransactions = CreditCard & {
  transactions: CreditCardTransactionWithCategory[];
};

export type AccountWithStats = Account & {
  totalBalance: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  transactionCount: number;
};
