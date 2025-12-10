import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    subtitle: z.string().optional(),
    lastUpdated: z.string().optional(),
  }),
});

const courses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    icon: z.enum(['sailboat', 'yacht']),
    duration: z.string(),
    period: z.string(),
    boatType: z.string(),
    price: z.number(),
    priceNote: z.string(),
    order: z.number(),
  }),
});

const pricing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    note: z.string().optional(),
    order: z.number(),
    items: z.array(z.object({
      name: z.string(),
      price: z.number(),
      note: z.string().optional(),
    })),
    discounts: z.array(z.object({
      description: z.string(),
      discount: z.string(),
    })).optional(),
  }),
});

export const collections = {
  pages,
  courses,
  pricing,
};

