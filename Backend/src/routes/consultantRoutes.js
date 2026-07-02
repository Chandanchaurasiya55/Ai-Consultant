import express from 'express';
import { 
  analyzeBusiness, 
  getReports, 
  getReportById, 
  enrichWebsite, 
  discoverCompetitors, 
  regenerateSection,
  exportReportJson,
  exportReportDocx
} from '../controller/consultantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure routes using JWT protect middleware
router.get('/enrich', protect, enrichWebsite);
router.post('/discover-competitors', protect, discoverCompetitors);
router.post('/analyze', protect, analyzeBusiness);
router.get('/reports', protect, getReports);
router.get('/reports/:id', protect, getReportById);
router.post('/reports/:id/regenerate-section', protect, regenerateSection);
router.get('/reports/:id/export/json', protect, exportReportJson);
router.get('/reports/:id/export/docx', protect, exportReportDocx);

export default router;

