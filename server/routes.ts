import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLandmarkSchema, insertSearchSchema } from "@shared/schema";
import { z } from "zod";

const boundsSchema = z.object({
  north: z.number(),
  south: z.number(), 
  east: z.number(),
  west: z.number()
});

const searchSchema = z.object({
  query: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get landmarks by map bounds
  app.get("/api/landmarks/bounds", async (req, res) => {
    try {
      const { north, south, east, west } = boundsSchema.parse({
        north: parseFloat(req.query.north as string),
        south: parseFloat(req.query.south as string),
        east: parseFloat(req.query.east as string),
        west: parseFloat(req.query.west as string)
      });

      // First check if we have cached landmarks in the bounds
      const cachedLandmarks = await storage.getLandmarksByBounds(north, south, east, west);
      
      // If we have some cached landmarks, return them
      if (cachedLandmarks.length > 0) {
        res.json(cachedLandmarks);
        return;
      }

      // Otherwise, fetch from Wikipedia API
      const centerLat = (north + south) / 2;
      const centerLng = (east + west) / 2;
      const radius = Math.max(
        Math.abs(north - south) * 111000, // Convert degrees to meters (approximate)
        Math.abs(east - west) * 111000 * Math.cos(centerLat * Math.PI / 180)
      ) / 2;

      try {
        // Use Wikipedia geosearch API to find articles with coordinates near the location
        const wikipediaResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${centerLat}%7C${centerLng}&gsradius=${Math.min(radius, 10000)}&gslimit=50&format=json&origin=*`
        );

        if (!wikipediaResponse.ok) {
          throw new Error(`Wikipedia API error: ${wikipediaResponse.status}`);
        }

        const wikipediaData = await wikipediaResponse.json();
        const landmarks = [];

        // Process Wikipedia geosearch results and save to storage
        for (const entry of wikipediaData.query?.geosearch || []) {
          if (entry.lat && entry.lon && entry.title) {
            // Fetch Wikipedia page summary for more details
            let description = '';
            let imageUrl = '';

            try {
              const summaryResponse = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(entry.title)}`
              );
              
              if (summaryResponse.ok) {
                const summary = await summaryResponse.json();
                description = summary.extract || '';
                if (summary.thumbnail && summary.thumbnail.source) {
                  imageUrl = summary.thumbnail.source;
                }
              }
            } catch (error) {
              console.error(`Error fetching Wikipedia summary for ${entry.title}:`, error);
            }

            // Determine landmark type based on title and description
            let type = 'Historical Sites';
            const titleLower = entry.title.toLowerCase();
            const descLower = description.toLowerCase();
            
            if (titleLower.includes('museum') || descLower.includes('museum')) {
              type = 'Museums';
            } else if (titleLower.includes('park') || titleLower.includes('garden') || descLower.includes('park')) {
              type = 'Parks & Nature';
            } else if (titleLower.includes('bridge') || titleLower.includes('building') || titleLower.includes('tower')) {
              type = 'Architecture';
            }

            const landmark = await storage.createLandmark({
              title: entry.title,
              description,
              lat: entry.lat,
              lng: entry.lon,
              type,
              wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(entry.title)}`,
              wikipediaPageId: entry.pageid,
              imageUrl,
              categories: [type]
            });

            landmarks.push(landmark);
          }
        }

        // Log search for analytics
        await storage.createSearch({
          query: `bounds:${north},${south},${east},${west}`,
          lat: centerLat,
          lng: centerLng,
          radius,
          resultCount: landmarks.length
        });

        res.json(landmarks);
      } catch (error) {
        console.error('Wikipedia API error:', error);
        res.status(500).json({ message: 'Failed to fetch landmarks from Wikipedia' });
      }
    } catch (error) {
      console.error('Bounds validation error:', error);
      res.status(400).json({ message: 'Invalid bounds parameters' });
    }
  });

  // Search landmarks
  app.get("/api/landmarks/search", async (req, res) => {
    try {
      const { query, lat, lng } = searchSchema.parse(req.query);

      // First search local landmarks
      const localResults = await storage.searchLandmarksByTitle(query);

      // If we have local results, return them
      if (localResults.length > 0) {
        res.json(localResults);
        return;
      }

      // Otherwise search Wikipedia
      try {
        const wikipediaResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/search?q=${encodeURIComponent(query)}&limit=20`
        );

        if (!wikipediaResponse.ok) {
          throw new Error(`Wikipedia search API error: ${wikipediaResponse.status}`);
        }

        const wikipediaData = await wikipediaResponse.json();
        const landmarks = [];

        for (const page of wikipediaData.pages || []) {
          try {
            // Get page summary to check if it has coordinates
            const summaryResponse = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`
            );

            if (summaryResponse.ok) {
              const summary = await summaryResponse.json();
              
              if (summary.coordinates) {
                let type = 'Historical Sites';
                const titleLower = page.title.toLowerCase();
                const descLower = (summary.extract || '').toLowerCase();
                
                if (titleLower.includes('museum') || descLower.includes('museum')) {
                  type = 'Museums';
                } else if (titleLower.includes('park') || titleLower.includes('garden') || descLower.includes('park')) {
                  type = 'Parks & Nature';
                } else if (titleLower.includes('bridge') || titleLower.includes('building') || titleLower.includes('tower')) {
                  type = 'Architecture';
                }

                const landmark = await storage.createLandmark({
                  title: page.title,
                  description: summary.extract || '',
                  lat: summary.coordinates.lat,
                  lng: summary.coordinates.lon,
                  type,
                  wikipediaUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                  wikipediaPageId: page.pageid,
                  imageUrl: summary.thumbnail?.source || '',
                  categories: [type]
                });

                landmarks.push(landmark);
              }
            }
          } catch (error) {
            console.error(`Error processing search result ${page.title}:`, error);
          }
        }

        // Log search
        await storage.createSearch({
          query,
          lat,
          lng,
          resultCount: landmarks.length
        });

        res.json(landmarks);
      } catch (error) {
        console.error('Wikipedia search error:', error);
        res.status(500).json({ message: 'Failed to search landmarks' });
      }
    } catch (error) {
      console.error('Search validation error:', error);
      res.status(400).json({ message: 'Invalid search parameters' });
    }
  });

  // Get landmark by ID
  app.get("/api/landmarks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const landmark = await storage.getLandmark(id);
      
      if (!landmark) {
        res.status(404).json({ message: 'Landmark not found' });
        return;
      }

      res.json(landmark);
    } catch (error) {
      console.error('Get landmark error:', error);
      res.status(500).json({ message: 'Failed to get landmark' });
    }
  });

  // Geocoding search for locations
  app.get("/api/geocode", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ message: 'Query parameter required' });
        return;
      }

      // Use Nominatim for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        importance: item.importance
      }));

      res.json(results);
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ message: 'Failed to geocode location' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
