// import express from 'express';
// import * as pageController from '../controllers/page.controller.js';
// import { protect } from '../middleware/auth.middleware.js';

// const router = express.Router();

// router.route('/')
//     .post(protect, pageController.createPage)
//     .get(protect, pageController.getUserPages);

// router.route('/:id')
//     .put(protect, pageController.updatePage)
//     .delete(protect, pageController.deletePage);

// router.get('/:slug', pageController.getPageBySlug);
// router.post('/:slug/submit', pageController.handleSubmission);

// export default router;


import express from 'express';
import * as pageController from '../controllers/page.controller.js';
import { getPageSubmissions } from '../controllers/submission.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkPlanLimits } from '../middleware/planCheck.middleware.js';
import { 
  validateCreatePage, 
  validateUpdatePage, 
  validatePageId, 
  validateSlug 
} from '../middleware/validation.middleware.js';
import { createPageLimiter } from '../middleware/rateLimiter.middleware.js';
import submissionRoutes from './submission.routes.js';

const router = express.Router();

// --- Mount submission route: POST /pages/:slug/submit ---
router.use('/:slug/submit', submissionRoutes);

// --- Protected user page routes ---
router
  .route('/')
  .post(protect, createPageLimiter, validateCreatePage, checkPlanLimits('page'), pageController.createPage)
  .get(protect, pageController.getUserPages);

router
  .route('/:id')
  .put(protect, validateUpdatePage, pageController.updatePage)
  .delete(protect, validatePageId, pageController.deletePage);

// --- Get submissions for a specific page ---
router.get('/:id/submissions', protect, validatePageId, getPageSubmissions);

// --- Public page access route ---
router.get('/:slug', validateSlug, pageController.getPageBySlug);

export default router;
