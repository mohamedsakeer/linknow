import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generateBio(name: string, location?: string, agentType?: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional copywriter helping real estate agents write short, compelling bios. Write in first person. Keep it under 120 characters. Be professional but friendly."
      },
      {
        role: "user", 
        content: `Write a short professional bio for a real estate agent named ${name}${location ? ` based in ${location}` : ''}${agentType === 'agency' ? ' who works with an agency' : ' who is an independent agent'}.`
      }
    ],
    max_tokens: 100,
  });
  
  return response.choices[0]?.message?.content?.trim() || "";
}

export async function generatePropertyDescription(property: {
  type: string;
  propertyType: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
}): Promise<string> {
  const listingType = property.type === 'rent' ? 'for rent' : 'for sale';
  const priceFormatted = property.price ? Number(property.price).toLocaleString() : 'competitive price';
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a real estate copywriter. Write unique, compelling property descriptions. Keep it under 150 characters. Be specific about the property details provided. Vary your writing style - don't start every description the same way."
      },
      {
        role: "user", 
        content: `Write a short property description for: ${property.beds} bedroom ${property.propertyType || 'property'} ${listingType} in ${property.location || 'prime location'}. Price: ${priceFormatted} AED. ${property.baths} bathrooms, ${property.sqft || 'spacious'} sqft.`
      }
    ],
    max_tokens: 100,
  });
  
  return response.choices[0]?.message?.content?.trim() || "";
}
