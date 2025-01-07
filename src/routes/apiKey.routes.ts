// // sử dụng trong admin api

// import express from 'express';
// import apiKeyController from '../controllers/apiKey.controller';
// import adminAuthMiddleware from '../middlewares/adminAuth.middleware';

// const router = express.Router();

// // Các routes này nên được bảo vệ bởi authentication middleware
// router.post('/api-keys', adminAuthMiddleware, apiKeyController.createApiKey);
// router.get('/api-keys/client/:clientId', adminAuthMiddleware, apiKeyController.getClientApiKeys);
// router.delete('/api-keys/:key', adminAuthMiddleware, apiKeyController.deactivateApiKey);

// export default router;