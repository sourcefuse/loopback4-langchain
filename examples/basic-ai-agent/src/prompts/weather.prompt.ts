/**
 * A prompt template for generating weather-related queries
 */
export class WeatherPrompt {
  /**
   * Name of the prompt
   */
  name = 'weather';

  /**
   * Description of the prompt
   */
  description = 'A prompt template for generating weather-related queries';

  /**
   * Generate a prompt to ask about the weather in a specific location
   * @param location The location to ask about
   * @param timeframe Optional timeframe (today, tomorrow, this week)
   * @returns A formatted prompt string
   */
  generatePrompt(location: string, timeframe: string = 'today'): string {
    return `
What is the weather ${timeframe} in ${location}?

Please provide:
- Temperature (high/low)
- Precipitation chance
- Wind conditions
- Any weather advisories or warnings
- A brief summary of the overall conditions

Format the response in a clear, readable way.
    `.trim();
  }

  /**
   * Generate a prompt to compare weather between two locations
   * @param location1 First location
   * @param location2 Second location
   * @param timeframe Optional timeframe (today, tomorrow, this week)
   * @returns A formatted prompt string
   */
  compareLocations(location1: string, location2: string, timeframe: string = 'today'): string {
    return `
Compare the weather ${timeframe} between ${location1} and ${location2}.

For each location, provide:
- Temperature (high/low)
- Precipitation chance
- Wind conditions
- Any weather advisories or warnings

Then provide a brief comparison highlighting the main differences.
    `.trim();
  }

  /**
   * Generate a prompt to ask about weather-appropriate activities
   * @param location The location to ask about
   * @param timeframe Optional timeframe (today, tomorrow, this week)
   * @returns A formatted prompt string
   */
  suggestActivities(location: string, timeframe: string = 'today'): string {
    return `
Based on the weather ${timeframe} in ${location}, what activities would be appropriate?

First, describe the weather conditions including:
- Temperature range
- Precipitation
- Wind conditions
- Overall weather pattern

Then suggest 5 activities that would be well-suited for these weather conditions,
explaining briefly why each activity is appropriate for the weather.
    `.trim();
  }
}
