import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeMood } from "./gemini";
import { 
  insertJournalEntrySchema, 
  updateJournalEntrySchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints
  const apiRouter = app.route('/api');
  
  // Get all journal entries for user
  app.get('/api/journal', async (req: Request, res: Response) => {
    try {
      // In a real app, get userId from authenticated session
      // For demo, use user id 1
      const userId = 1;
      const entries = await storage.getJournalEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ message: 'Failed to fetch journal entries' });
    }
  });
  
  // Get a specific journal entry
  app.get('/api/journal/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid journal entry ID' });
      }
      
      const entry = await storage.getJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      res.status(500).json({ message: 'Failed to fetch journal entry' });
    }
  });
  
  // Create a new journal entry
  app.post('/api/journal', async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = insertJournalEntrySchema.parse(req.body);
      
      // Create the journal entry
      const newEntry = await storage.createJournalEntry(validatedData);
      
      // Analyze the mood if there's content
      if (newEntry.content) {
        try {
          const analysis = await analyzeMood(newEntry.content);
          
          // Update the entry with sentiment analysis
          const updatedEntry = await storage.updateJournalEntry(newEntry.id, {
            mood: newEntry.mood,
            content: newEntry.content,
            sentiment: analysis.sentiment,
            energy: analysis.energy,
            wordCount: newEntry.content.split(/\s+/).filter(Boolean).length
          });
          
          // Return the entry with analysis
          return res.status(201).json({
            ...updatedEntry,
            analysis: {
              summary: analysis.summary,
              keywords: analysis.keywords
            }
          });
        } catch (analysisError) {
          console.error('Error analyzing mood:', analysisError);
          // Still return the entry even if analysis fails
          return res.status(201).json(newEntry);
        }
      }
      
      res.status(201).json(newEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error creating journal entry:', error);
      res.status(500).json({ message: 'Failed to create journal entry' });
    }
  });
  
  // Update a journal entry
  app.put('/api/journal/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid journal entry ID' });
      }
      
      // Validate the request body
      const validatedData = updateJournalEntrySchema.parse(req.body);
      
      // Update the entry
      const updatedEntry = await storage.updateJournalEntry(id, validatedData);
      if (!updatedEntry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error('Error updating journal entry:', error);
      res.status(500).json({ message: 'Failed to update journal entry' });
    }
  });
  
  // Delete a journal entry
  app.delete('/api/journal/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid journal entry ID' });
      }
      
      const success = await storage.deleteJournalEntry(id);
      if (!success) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(500).json({ message: 'Failed to delete journal entry' });
    }
  });
  
  // Get recent journal entries for dashboard
  app.get('/api/journal/recent/:limit', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      // In a real app, get userId from authenticated session
      const userId = 1;
      
      const entries = await storage.getRecentJournalEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching recent journal entries:', error);
      res.status(500).json({ message: 'Failed to fetch recent journal entries' });
    }
  });
  
  // Analyze existing journal entry
  app.post('/api/journal/:id/analyze', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid journal entry ID' });
      }
      
      const entry = await storage.getJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ message: 'Journal entry not found' });
      }
      
      // Perform mood analysis
      const analysis = await analyzeMood(entry.content);
      
      // Update entry with analysis results
      const updatedEntry = await storage.updateJournalEntry(id, {
        mood: entry.mood,
        content: entry.content,
        sentiment: analysis.sentiment,
        energy: analysis.energy,
        wordCount: entry.content.split(/\s+/).filter(Boolean).length
      });
      
      res.json({
        entry: updatedEntry,
        analysis: {
          summary: analysis.summary,
          keywords: analysis.keywords
        }
      });
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      res.status(500).json({ message: 'Failed to analyze journal entry' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
