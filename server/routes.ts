import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAccountSchema, 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertCreditCardSchema,
  insertCreditCardTransactionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Account routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  app.get("/api/accounts/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const month = req.query.month as string || new Date().toISOString().substring(0, 7);
      const stats = await storage.getAccountStats(id, month);
      if (!stats) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account stats" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(id, validatedData);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccount(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Category routes
  app.get("/api/accounts/:accountId/categories", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const categories = await storage.getCategories(accountId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/accounts/:accountId/categories/stats", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const month = req.query.month as string || new Date().toISOString().substring(0, 7);
      const stats = await storage.getCategoryStats(accountId, month);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category stats" });
    }
  });

  app.post("/api/accounts/:accountId/categories", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const validatedData = insertCategorySchema.parse({
        ...req.body,
        accountId,
      });
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Transaction routes
  app.get("/api/accounts/:accountId/transactions", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      let transactions;
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(accountId, startDate, endDate);
      } else {
        transactions = await storage.getTransactions(accountId, limit);
      }

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/accounts/:accountId/transactions", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        accountId,
      });
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Credit card routes
  app.get("/api/accounts/:accountId/credit-cards", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const creditCards = await storage.getCreditCards(accountId);
      res.json(creditCards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit cards" });
    }
  });

  app.get("/api/credit-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const creditCard = await storage.getCreditCard(id);
      if (!creditCard) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.json(creditCard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit card" });
    }
  });

  app.post("/api/accounts/:accountId/credit-cards", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const validatedData = insertCreditCardSchema.parse({
        ...req.body,
        accountId,
      });
      const creditCard = await storage.createCreditCard(validatedData);
      res.status(201).json(creditCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit card" });
    }
  });

  app.patch("/api/credit-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCreditCardSchema.partial().parse(req.body);
      const creditCard = await storage.updateCreditCard(id, validatedData);
      if (!creditCard) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.json(creditCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit card" });
    }
  });

  app.delete("/api/credit-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCreditCard(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credit card" });
    }
  });

  // Credit card transaction routes
  app.get("/api/accounts/:accountId/credit-card-transactions", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const creditCardId = req.query.creditCardId ? parseInt(req.query.creditCardId as string) : undefined;
      const transactions = await storage.getCreditCardTransactions(accountId, creditCardId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit card transactions" });
    }
  });

  app.post("/api/accounts/:accountId/credit-card-transactions", async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const validatedData = insertCreditCardTransactionSchema.parse({
        ...req.body,
        accountId,
      });
      const transaction = await storage.createCreditCardTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit card transaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
