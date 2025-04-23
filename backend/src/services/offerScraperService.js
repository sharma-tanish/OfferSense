import axios from 'axios';
import cheerio from 'cheerio';
import { Configuration, OpenAIApi } from 'openai';
import { config } from '../config.js';

const OFFER_CATEGORIES = {
  TRAVEL: {
    keywords: ['flight', 'hotel', 'travel', 'vacation', 'holiday', 'trip', 'airline', 'booking'],
    websites: [
      'https://www.makemytrip.com/offers',
      'https://www.goibibo.com/offers',
      'https://www.booking.com/special-offers',
      'https://www.agoda.com/promotions'
    ]
  },
  ENTERTAINMENT: {
    keywords: ['movie', 'cinema', 'streaming', 'concert', 'event', 'ticket', 'show', 'theatre'],
    websites: [
      'https://in.bookmyshow.com/offers',
      'https://www.paytm.com/offers/movies',
      'https://www.amazon.in/primevideo/offers'
    ]
  },
  SHOPPING: {
    keywords: ['shopping', 'retail', 'store', 'fashion', 'electronics', 'apparel', 'grocery'],
    websites: [
      'https://www.amazon.in/gp/goldbox',
      'https://www.flipkart.com/offers-store',
      'https://www.myntra.com/offers'
    ]
  },
  DINING: {
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'delivery', 'takeaway', 'meal'],
    websites: [
      'https://www.zomato.com/offers',
      'https://www.swiggy.com/offers',
      'https://www.eazydiner.com/offers'
    ]
  },
  FUEL: {
    keywords: ['petrol', 'diesel', 'fuel', 'gas', 'filling', 'station'],
    websites: [
      'https://www.rupay.co.in/offers/fuel',
      'https://www.paytm.com/offers/fuel'
    ]
  }
};

class OfferScraperService {
  constructor() {
    this.configuration = new Configuration({
      apiKey: config.openai.apiKey,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  async getOffersForCard(cardDetails) {
    try {
      const allOffers = [];
      
      // Get offers for each category
      for (const [category, { keywords, websites }] of Object.entries(OFFER_CATEGORIES)) {
        const categoryOffers = await this.scrapeCategoryOffers(cardDetails, category, keywords, websites);
        allOffers.push(...categoryOffers.map(offer => ({
          ...offer,
          category
        })));
      }

      // Validate and filter offers
      const validatedOffers = await this.validateOffers(allOffers, cardDetails);
      
      // Group offers by category
      return this.groupOffersByCategory(validatedOffers);
    } catch (error) {
      console.error('Error in offer scraping:', error);
      throw new Error('Failed to fetch offers');
    }
  }

  async scrapeCategoryOffers(cardDetails, category, keywords, websites) {
    const offers = [];
    
    // Generate category-specific search queries
    const searchQueries = await this.generateCategorySearchQueries(cardDetails, category, keywords);
    
    // Scrape from category-specific websites
    for (const website of websites) {
      const websiteOffers = await this.scrapeWebsite(website, searchQueries);
      offers.push(...websiteOffers);
    }

    return offers;
  }

  async generateCategorySearchQueries(cardDetails, category, keywords) {
    const prompt = `Generate 3 specific search queries to find ${category.toLowerCase()} offers and discounts for:
    - Card Type: ${cardDetails.cardType}
    - Bank: ${cardDetails.bankName}
    - Keywords: ${keywords.join(', ')}
    - Current Month: ${new Date().toLocaleString('default', { month: 'long' })}
    
    Format the response as a JSON array of strings.`;

    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 150,
        temperature: 0.7,
      });

      return JSON.parse(response.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error generating search queries:', error);
      return [];
    }
  }

  async scrapeWebsite(url, searchQueries) {
    const offers = [];
    
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Add specific scraping logic for each website type
      $('.offer-card, .deal-card, .promotion').each((i, element) => {
        const title = $(element).find('.title, .heading, h3').text().trim();
        const description = $(element).find('.description, .details, p').text().trim();
        const discount = this.extractDiscount($(element).find('.discount, .percentage').text());
        const validUntil = this.extractValidUntil($(element).find('.validity, .expiry').text());
        const link = url + $(element).find('a').attr('href');
        
        if (title && description) {
          offers.push({
            title,
            description,
            discount,
            validUntil,
            link,
            source: url
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }

    return offers;
  }

  groupOffersByCategory(offers) {
    const groupedOffers = {};
    
    for (const offer of offers) {
      if (!groupedOffers[offer.category]) {
        groupedOffers[offer.category] = [];
      }
      groupedOffers[offer.category].push(offer);
    }

    return groupedOffers;
  }

  async validateOffers(offers, cardDetails) {
    const prompt = `Validate and filter these offers for a ${cardDetails.cardType} card from ${cardDetails.bankName}:
    ${JSON.stringify(offers, null, 2)}
    
    Return only valid offers that are:
    1. Currently active
    2. Applicable to the specified card type and bank
    3. Have clear terms and conditions
    4. Have a valid discount percentage
    
    Format the response as a JSON array of valid offers.`;

    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 1000,
        temperature: 0.3,
      });

      return JSON.parse(response.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error validating offers:', error);
      return offers; // Return original offers if validation fails
    }
  }

  extractDiscount(text) {
    const match = text.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  extractValidUntil(text) {
    const match = text.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+(\w+)\s+(\d{4})/i);
    if (match) {
      const [_, day, month, year] = match;
      return new Date(`${month} ${day}, ${year}`).toISOString();
    }
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default to 30 days from now
  }
}

export default new OfferScraperService(); 