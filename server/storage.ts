import { 
  accounts, 
  categories, 
  transactions, 
  creditCards, 
  creditCardTransactions,
  type Account, 
  type InsertAccount,
  type Category,
  type InsertCategory,
  type Transaction,
  type InsertTransaction,
  type TransactionWithCategory,
  type CreditCard,
  type InsertCreditCard,
  type CreditCardTransaction,
  type InsertCreditCardTransaction,
  type CreditCardTransactionWithCategory,
  type AccountWithStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Account methods
  createAccount(account: InsertAccount): Promise<Account>;
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<void>;

  // Category methods
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(accountId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<void>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(accountId: number, limit?: number): Promise<TransactionWithCategory[]>;
  getTransactionsByDateRange(accountId: number, startDate: string, endDate: string): Promise<TransactionWithCategory[]>;
  getTransaction(id: number): Promise<TransactionWithCategory | undefined>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;

  // Credit card methods
  createCreditCard(creditCard: InsertCreditCard): Promise<CreditCard>;
  getCreditCards(accountId: number): Promise<CreditCard[]>;
  getCreditCard(id: number): Promise<CreditCard | undefined>;
  updateCreditCard(id: number, creditCard: Partial<InsertCreditCard>): Promise<CreditCard | undefined>;
  deleteCreditCard(id: number): Promise<void>;

  // Credit card transaction methods
  createCreditCardTransaction(transaction: InsertCreditCardTransaction): Promise<CreditCardTransaction>;
  getCreditCardTransactions(accountId: number, creditCardId?: number): Promise<CreditCardTransactionWithCategory[]>;
  getCreditCardTransaction(id: number): Promise<CreditCardTransactionWithCategory | undefined>;
  updateCreditCardTransaction(id: number, transaction: Partial<InsertCreditCardTransaction>): Promise<CreditCardTransaction | undefined>;
  deleteCreditCardTransaction(id: number): Promise<void>;

  // Analytics methods
  getAccountStats(accountId: number, month: string): Promise<AccountWithStats | undefined>;
  getCategoryStats(accountId: number, month: string): Promise<Array<{ categoryId: number; categoryName: string; total: string; color: string; }>>;
}

export class DatabaseStorage implements IStorage {
  // Account methods
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    
    // Create default categories for the account
    await this.createDefaultCategories(account.id, account.type);
    
    return account;
  }

  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteAccount(id: number): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  private async createDefaultCategories(accountId: number, accountType: string): Promise<void> {
    const defaultCategories = [
      { name: "Alimentação", color: "#3B82F6", icon: "fas fa-utensils" },
      { name: "Transporte", color: "#10B981", icon: "fas fa-car" },
      { name: "Saúde", color: "#EF4444", icon: "fas fa-heart" },
      { name: "Lazer", color: "#8B5CF6", icon: "fas fa-gamepad" },
      { name: "Educação", color: "#F59E0B", icon: "fas fa-graduation-cap" },
      { name: "Casa", color: "#06B6D4", icon: "fas fa-home" },
      { name: "Outros", color: "#6B7280", icon: "fas fa-ellipsis-h" },
    ];

    if (accountType === "business") {
      defaultCategories.push(
        { name: "Escritório", color: "#1F2937", icon: "fas fa-building" },
        { name: "Marketing", color: "#EC4899", icon: "fas fa-bullhorn" },
        { name: "Tecnologia", color: "#3B82F6", icon: "fas fa-laptop" },
        { name: "Fornecedores", color: "#059669", icon: "fas fa-truck" },
      );
    }

    for (const category of defaultCategories) {
      await db.insert(categories).values({
        ...category,
        accountId,
      });
    }
  }

  // Category methods
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getCategories(accountId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.accountId, accountId))
      .orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTransactions(accountId: number, limit?: number): Promise<TransactionWithCategory[]> {
    let query = db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        categoryId: transactions.categoryId,
        accountId: transactions.accountId,
        paymentMethod: transactions.paymentMethod,
        clientName: transactions.clientName,
        projectName: transactions.projectName,
        costCenter: transactions.costCenter,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return await query;
  }

  async getTransactionsByDateRange(accountId: number, startDate: string, endDate: string): Promise<TransactionWithCategory[]> {
    return await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        categoryId: transactions.categoryId,
        accountId: transactions.accountId,
        paymentMethod: transactions.paymentMethod,
        clientName: transactions.clientName,
        projectName: transactions.projectName,
        costCenter: transactions.costCenter,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.accountId, accountId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date), desc(transactions.createdAt));
  }

  async getTransaction(id: number): Promise<TransactionWithCategory | undefined> {
    const [transaction] = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        date: transactions.date,
        categoryId: transactions.categoryId,
        accountId: transactions.accountId,
        paymentMethod: transactions.paymentMethod,
        clientName: transactions.clientName,
        projectName: transactions.projectName,
        costCenter: transactions.costCenter,
        createdAt: transactions.createdAt,
        category: categories,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  // Credit card methods
  async createCreditCard(insertCreditCard: InsertCreditCard): Promise<CreditCard> {
    const [creditCard] = await db
      .insert(creditCards)
      .values(insertCreditCard)
      .returning();
    return creditCard;
  }

  async getCreditCards(accountId: number): Promise<CreditCard[]> {
    return await db
      .select()
      .from(creditCards)
      .where(eq(creditCards.accountId, accountId))
      .orderBy(creditCards.name);
  }

  async getCreditCard(id: number): Promise<CreditCard | undefined> {
    const [creditCard] = await db.select().from(creditCards).where(eq(creditCards.id, id));
    return creditCard || undefined;
  }

  async updateCreditCard(id: number, creditCard: Partial<InsertCreditCard>): Promise<CreditCard | undefined> {
    const [updatedCreditCard] = await db
      .update(creditCards)
      .set(creditCard)
      .where(eq(creditCards.id, id))
      .returning();
    return updatedCreditCard || undefined;
  }

  async deleteCreditCard(id: number): Promise<void> {
    await db.delete(creditCards).where(eq(creditCards.id, id));
  }

  // Credit card transaction methods
  async createCreditCardTransaction(insertTransaction: InsertCreditCardTransaction): Promise<CreditCardTransaction> {
    const [transaction] = await db
      .insert(creditCardTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getCreditCardTransactions(accountId: number, creditCardId?: number): Promise<CreditCardTransactionWithCategory[]> {
    let whereCondition = eq(creditCardTransactions.accountId, accountId);
    
    if (creditCardId) {
      whereCondition = and(whereCondition, eq(creditCardTransactions.creditCardId, creditCardId));
    }

    return await db
      .select({
        id: creditCardTransactions.id,
        description: creditCardTransactions.description,
        amount: creditCardTransactions.amount,
        date: creditCardTransactions.date,
        installments: creditCardTransactions.installments,
        currentInstallment: creditCardTransactions.currentInstallment,
        categoryId: creditCardTransactions.categoryId,
        creditCardId: creditCardTransactions.creditCardId,
        accountId: creditCardTransactions.accountId,
        clientName: creditCardTransactions.clientName,
        projectName: creditCardTransactions.projectName,
        costCenter: creditCardTransactions.costCenter,
        createdAt: creditCardTransactions.createdAt,
        category: categories,
      })
      .from(creditCardTransactions)
      .leftJoin(categories, eq(creditCardTransactions.categoryId, categories.id))
      .where(whereCondition)
      .orderBy(desc(creditCardTransactions.date), desc(creditCardTransactions.createdAt));
  }

  async getCreditCardTransaction(id: number): Promise<CreditCardTransactionWithCategory | undefined> {
    const [transaction] = await db
      .select({
        id: creditCardTransactions.id,
        description: creditCardTransactions.description,
        amount: creditCardTransactions.amount,
        date: creditCardTransactions.date,
        installments: creditCardTransactions.installments,
        currentInstallment: creditCardTransactions.currentInstallment,
        categoryId: creditCardTransactions.categoryId,
        creditCardId: creditCardTransactions.creditCardId,
        accountId: creditCardTransactions.accountId,
        clientName: creditCardTransactions.clientName,
        projectName: creditCardTransactions.projectName,
        costCenter: creditCardTransactions.costCenter,
        createdAt: creditCardTransactions.createdAt,
        category: categories,
      })
      .from(creditCardTransactions)
      .leftJoin(categories, eq(creditCardTransactions.categoryId, categories.id))
      .where(eq(creditCardTransactions.id, id));
    return transaction || undefined;
  }

  async updateCreditCardTransaction(id: number, transaction: Partial<InsertCreditCardTransaction>): Promise<CreditCardTransaction | undefined> {
    const [updatedTransaction] = await db
      .update(creditCardTransactions)
      .set(transaction)
      .where(eq(creditCardTransactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async deleteCreditCardTransaction(id: number): Promise<void> {
    await db.delete(creditCardTransactions).where(eq(creditCardTransactions.id, id));
  }

  // Analytics methods
  async getAccountStats(accountId: number, month: string): Promise<AccountWithStats | undefined> {
    const account = await this.getAccount(accountId);
    if (!account) return undefined;

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    // Get monthly transactions
    const monthlyTransactions = await this.getTransactionsByDateRange(accountId, startDate, endDate);
    
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Get all transactions for total balance
    const allTransactions = await this.getTransactions(accountId);
    const totalBalance = allTransactions.reduce((sum, t) => {
      return t.type === 'income' 
        ? sum + parseFloat(t.amount)
        : sum - parseFloat(t.amount);
    }, 0);

    return {
      ...account,
      totalBalance: totalBalance.toFixed(2),
      monthlyIncome: monthlyIncome.toFixed(2),
      monthlyExpenses: monthlyExpenses.toFixed(2),
      transactionCount: allTransactions.length,
    };
  }

  async getCategoryStats(accountId: number, month: string): Promise<Array<{ categoryId: number; categoryName: string; total: string; color: string; }>> {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const result = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        color: categories.color,
        total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(categories)
      .leftJoin(
        transactions,
        and(
          eq(transactions.categoryId, categories.id),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .where(eq(categories.accountId, accountId))
      .groupBy(categories.id, categories.name, categories.color)
      .orderBy(sql`SUM(${transactions.amount}) DESC NULLS LAST`);

    return result;
  }
}

export const storage = new DatabaseStorage();
