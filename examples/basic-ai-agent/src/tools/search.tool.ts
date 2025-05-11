import {langchainTools, Tool} from 'loopback4-langchain';
import {z} from 'zod';

/**
 * A search tool that simulates searching for information on the web
 */
@langchainTools()
export class SearchTool implements Tool {
  name = 'search';
  description = 'Search for information on the web. Use this when you need to find facts, data, or information that you don\'t already know.';
  schema = z.object({
    input: z.string().optional(),
  }).transform(input => input.input || "");

  async run(query: string): Promise<string> {
    try {
      // This is a simulated search tool - in a real application, you would
      // integrate with an actual search API like Google Custom Search, Bing, etc.

      // Normalize the query
      const normalizedQuery = query.trim().toLowerCase();

      // Return simulated search results based on the query
      if (normalizedQuery.includes('weather')) {
        return this.getWeatherSearchResults(normalizedQuery);
      } else if (normalizedQuery.includes('news')) {
        return this.getNewsSearchResults(normalizedQuery);
      } else if (normalizedQuery.includes('recipe') || normalizedQuery.includes('food')) {
        return this.getRecipeSearchResults(normalizedQuery);
      } else if (normalizedQuery.includes('history')) {
        return this.getHistorySearchResults(normalizedQuery);
      } else if (normalizedQuery.includes('technology') || normalizedQuery.includes('tech')) {
        return this.getTechnologySearchResults(normalizedQuery);
      } else {
        return this.getGenericSearchResults(normalizedQuery);
      }
    } catch (error) {
      return `Error performing search: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private getWeatherSearchResults(query: string): string {
    return `
Search results for "${query}":

1. National Weather Service - Current Weather Conditions
   Current conditions across the country show varied patterns with a major system moving through the Midwest.

2. AccuWeather - 10-Day Forecast
   Extended forecasts show a warming trend for the Eastern seaboard with potential precipitation in the Pacific Northwest.

3. Weather.com - Severe Weather Alerts
   Flash flood warnings in effect for parts of Texas and Oklahoma. Heat advisories across the Southwest.

4. Climate Data Online - Historical Weather Patterns
   Analysis shows this month is trending 2.3°F above historical averages in most regions.

5. Farmers' Almanac - Seasonal Weather Predictions
   Long-range forecasts predict a wetter than normal spring for most of the country.
    `.trim();
  }

  private getNewsSearchResults(query: string): string {
    return `
Search results for "${query}":

1. CNN - Breaking News (10 minutes ago)
   Latest developments in international diplomacy as leaders meet at summit.

2. Reuters - World News (1 hour ago)
   Economic indicators show stronger than expected growth in emerging markets.

3. Associated Press - Politics (2 hours ago)
   New legislation proposed to address infrastructure funding across rural areas.

4. BBC News - Technology (3 hours ago)
   Major tech companies announce collaboration on AI safety standards.

5. Local News Network - Community Updates (5 hours ago)
   City council approves new development project in downtown area.
    `.trim();
  }

  private getRecipeSearchResults(query: string): string {
    return `
Search results for "${query}":

1. AllRecipes - Quick & Easy Meals
   15-minute dinner recipes that require minimal ingredients and preparation.

2. Food Network - Seasonal Cooking
   Best ways to use fresh, in-season produce in your everyday cooking.

3. Epicurious - Dietary Restrictions
   Top-rated recipes for various dietary needs including gluten-free, vegan, and keto options.

4. Bon Appétit - Cooking Techniques
   Master basic cooking methods with step-by-step guides and videos.

5. NYT Cooking - Editor's Picks
   Curated collection of recipes highly recommended by food editors and chefs.
    `.trim();
  }

  private getHistorySearchResults(query: string): string {
    return `
Search results for "${query}":

1. History.com - This Day in History
   Significant events that occurred on this date throughout history.

2. National Archives - Primary Sources
   Digitized historical documents and records related to major historical events.

3. Smithsonian Magazine - Archaeological Discoveries
   Recent findings that have changed our understanding of ancient civilizations.

4. World History Encyclopedia - Comprehensive Guides
   In-depth articles covering various historical periods and civilizations.

5. Library of Congress - Historical Collections
   Preserved photographs, manuscripts, and media documenting historical moments.
    `.trim();
  }

  private getTechnologySearchResults(query: string): string {
    return `
Search results for "${query}":

1. TechCrunch - Latest Startups
   New companies disrupting traditional industries with innovative approaches.

2. Wired - Future Technology
   Emerging technologies that could transform how we live and work.

3. MIT Technology Review - Research Breakthroughs
   Scientific advances from leading research institutions and their potential applications.

4. Ars Technica - In-Depth Analysis
   Detailed examination of recent developments in computing and technology.

5. CNET - Product Reviews
   Comprehensive evaluations of the latest consumer technology products.
    `.trim();
  }

  private getGenericSearchResults(query: string): string {
    return `
Search results for "${query}":

1. Wikipedia - General Information
   Basic overview and key facts related to your search query.

2. Educational Resources - Academic Perspective
   Scholarly articles and educational materials on this topic.

3. Popular Science - Simplified Explanations
   Easy-to-understand breakdowns of complex concepts related to your query.

4. Industry Publications - Expert Analysis
   Professional insights and specialized information from industry experts.

5. Community Forums - User Experiences
   Discussions and personal accounts from people with first-hand knowledge.
    `.trim();
  }
}
