import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessDetails: {
    // Step 1
    businessName: { type: String, required: true },
    businessIdea: { type: String, default: '' },
    businessDescription: { type: String, default: '' },
    businessCategory: { type: String, default: '' },
    industry: { type: String, required: true },
    businessModel: { type: String, required: true },
    businessStage: { type: String, required: true },
    websiteUrl: { type: String, default: '' },

    // Step 2
    targetCountry: { type: String, default: '' },
    targetState: { type: String, default: '' },
    targetCity: { type: String, default: '' },
    targetLanguage: { type: String, default: '' },
    geoLocation: { type: String, default: '' },
    urbanRural: { type: String, default: '' },

    // Step 3
    targetAudience: { type: String, required: true },
    ageGroup: { type: String, default: '' },
    gender: { type: String, default: '' },
    income: { type: String, default: '' },
    education: { type: String, default: '' },
    occupation: { type: String, default: '' },
    interests: { type: String, default: '' },
    painPoints: { type: String, default: '' },
    buyingBehaviour: { type: String, default: '' },
    customerGoals: { type: String, default: '' },

    // Step 4
    products: { type: String, required: true },
    services: { type: String, default: '' },
    priceRange: { type: String, default: '' },
    usp: { type: String, default: '' },
    competitors: [{ type: String }],
    budget: { type: String, default: '' },
    expectedRevenue: { type: String, default: '' },
    marketingBudget: { type: String, required: true },

    // Legacy fields fallback support
    primaryGoal: { type: String, default: '' },
    revenueModel: { type: String, default: '' },
    monthlyVisitors: { type: String, default: '' },
    currentMarketing: { type: String, default: '' },
    techStack: { type: String, default: '' },
    brandGuidelines: { type: String, default: '' },

    // Step 5
    researchPreferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  structure: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  volumeStatus: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sections: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sources: [{
    title: { type: String },
    url: { type: String },
    snippet: { type: String }
  }],
  bonusAssets: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;

