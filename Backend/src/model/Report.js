import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessDetails: {
    businessName: { type: String, required: true },
    industry: { type: String, required: true },
    products: { type: String, required: true },
    businessModel: { type: String, required: true },
    businessStage: { type: String, required: true },
    targetCountryCities: { type: String, required: true },
    targetAudience: { type: String, required: true },
    marketingBudget: { type: String, required: true },
    primaryGoal: { type: String, required: true },
    websiteUrl: { type: String, default: '' },
    revenueModel: { type: String, default: '' },
    monthlyVisitors: { type: String, default: '' },
    currentMarketing: { type: String, default: '' },
    competitors: [{ type: String }],
    usp: { type: String, default: '' },
    techStack: { type: String, default: '' },
    brandGuidelines: { type: String, default: '' }
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
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;

